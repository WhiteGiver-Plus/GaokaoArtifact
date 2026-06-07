import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clientIpHash, hashText, readJsonBody, requireMethod, sendError, stableJson } from "../_lib/http.js";
import { getSupabase } from "../_lib/supabase.js";
import { assertClientResultMatches, replayDecisionTrace } from "../_lib/verifyRun.js";
import type { VerifyRunRequest } from "../../gh_pages_local_game/src/core/trace.js";
import { DEBUG_NICKNAME, reviewNickname, sanitizeNickname } from "../../gh_pages_local_game/src/core/moderation.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!requireMethod(req, res, "POST")) return;
  try {
    const body = readJsonBody<VerifyRunRequest>(req);
    if (!body.sessionId || !body.trace || !body.clientResult) {
      sendError(res, 400, "invalid_verify_request");
      return;
    }
    const verified = await replayDecisionTrace(body.trace);
    assertClientResultMatches(verified, body.clientResult);

    const nicknameReview = reviewNickname(body.nickname);
    if (!nicknameReview.ok) {
      sendError(res, 400, nicknameReview.error ?? "invalid_nickname");
      return;
    }
    const nickname = sanitizeNickname(body.nickname, "匿名考生");
    if (nickname === DEBUG_NICKNAME) {
      sendError(res, 400, "debug_run_not_ranked");
      return;
    }
    const traceHash = hashText(`${stableJson(body.trace)}:${process.env.LEADERBOARD_SALT ?? "dev"}`);
    const supabase = getSupabase();
    const { data: run, error: runError } = await supabase
      .from("runs")
      .upsert(
        {
          trace_hash: traceHash,
          session_id: body.sessionId.slice(0, 120),
          nickname,
          seed: verified.seed,
          subjects: verified.subjects,
          year: verified.year,
          threshold: verified.threshold,
          total_score: Math.round(verified.totalScore),
          artifact_ids: verified.artifactIds,
          artifact_names: verified.artifactNames,
          result_payload: verified,
          decision_trace: body.trace,
          app_version: body.appVersion ?? null,
          ip_hash: clientIpHash(req)
        },
        { onConflict: "trace_hash" }
      )
      .select("id")
      .single();
    if (runError) throw runError;

    const { data: entry, error: entryError } = await supabase
      .from("leaderboard_entries")
      .upsert(
        {
          run_id: run.id,
          nickname,
          score: Math.round(verified.totalScore),
          year: verified.year,
          threshold: verified.threshold,
          seed: verified.seed,
          artifact_count: verified.artifactIds.length,
          app_version: body.appVersion ?? null,
          share_payload: {
            seed: verified.seed,
            trace: body.trace,
            ...(body.appVersion ? { appVersion: body.appVersion } : {}),
            subjects: verified.subjects,
            exams: verified.exams.map((exam) => ({
              subject: exam.subject,
              score: Math.round(exam.score)
            })),
            artifactIds: verified.artifactIds,
            artifactNames: verified.artifactNames,
            totalScore: Math.round(verified.totalScore),
            year: verified.year,
            threshold: verified.threshold
          }
        },
        { onConflict: "run_id" }
      )
      .select("id, run_id, nickname, score, year, threshold, seed, artifact_count, app_version, share_payload, created_at")
      .single();
    if (entryError) throw entryError;

    res.status(200).json({
      ok: true,
      entry: {
        id: entry.id,
        runId: entry.run_id,
        nickname: entry.nickname,
        score: entry.score,
        year: entry.year,
        threshold: entry.threshold,
        seed: entry.seed,
        artifactCount: entry.artifact_count,
        createdAt: entry.created_at,
        appVersion: entry.app_version ?? entry.share_payload?.appVersion,
        share: entry.share_payload
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "verify_failed";
    const status = message === "missing_supabase_env" ? 503 : message.endsWith("_mismatch") || message.startsWith("invalid_") ? 400 : 500;
    sendError(res, status, message);
  }
}
