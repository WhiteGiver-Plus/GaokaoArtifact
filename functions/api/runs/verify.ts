import type { LeaderboardSharePayload, VerifyRunRequest } from "../../../gh_pages_local_game/src/core/trace.js";
import { DEBUG_NICKNAME, reviewNickname, sanitizeNickname } from "../../../gh_pages_local_game/src/core/moderation.js";
import { assertClientResultMatches, replayDecisionTrace } from "../_lib/verifyRun.js";
import { checkRateLimit } from "../_lib/rateLimit.js";
import {
  clientIp,
  clientIpHash,
  hashText,
  jsonResponse,
  jsonText,
  leaderboardSalt,
  parseJsonField,
  randomId,
  readJsonBody,
  sendError,
  stableJson
} from "../_lib/http.js";
import type { D1Database, D1Value, HandlerContext } from "../_lib/types.js";

interface RunRow {
  id: string;
}

interface LeaderboardRow {
  id: string;
  run_id: string;
  nickname: string;
  score: number;
  year: number;
  threshold: number;
  seed: string;
  artifact_count: number;
  app_version: string | null;
  share_payload: string | null;
  created_at: string;
}

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  try {
    const body = await readJsonBody<VerifyRunRequest>(context.request);
    if (!body.sessionId || !body.trace || !body.clientResult) {
      return sendError(400, "invalid_verify_request");
    }

    const verified = await replayDecisionTrace(body.trace);
    assertClientResultMatches(verified, body.clientResult);

    const nicknameReview = reviewNickname(body.nickname);
    if (!nicknameReview.ok) {
      return sendError(400, nicknameReview.error ?? "invalid_nickname");
    }

    const nickname = sanitizeNickname(body.nickname, "匿名考生");
    if (nickname === DEBUG_NICKNAME) {
      return sendError(400, "debug_run_not_ranked");
    }

    const ip = clientIp(context.request).slice(0, 120);
    const ipHash = await clientIpHash(context.request, context.env);
    const allowed = await checkRateLimit(context.env.DB, {
      scope: "leaderboard",
      ipHash,
      max: 20,
      windowSeconds: 10 * 60
    });
    if (!allowed) return sendError(429, "rate_limited");

    const traceHash = await hashText(`${stableJson(body.trace)}:${leaderboardSalt(context.env)}`);
    const runId = randomId();
    const run = await context.env.DB.prepare(
      `insert into runs
         (id, trace_hash, session_id, nickname, seed, subjects, year, threshold, total_score,
          artifact_ids, artifact_names, result_payload, decision_trace, app_version, ip_hash, ip)
       values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)
       on conflict(trace_hash) do update set
         session_id = excluded.session_id,
         nickname = excluded.nickname,
         seed = excluded.seed,
         subjects = excluded.subjects,
         year = excluded.year,
         threshold = excluded.threshold,
         total_score = excluded.total_score,
         artifact_ids = excluded.artifact_ids,
         artifact_names = excluded.artifact_names,
         result_payload = excluded.result_payload,
         decision_trace = excluded.decision_trace,
         app_version = excluded.app_version,
         ip_hash = excluded.ip_hash,
         ip = excluded.ip
       returning id`
    )
      .bind(
        runId,
        traceHash,
        body.sessionId.slice(0, 120),
        nickname,
        verified.seed,
        jsonText(verified.subjects),
        verified.year,
        Math.round(verified.threshold),
        Math.round(verified.totalScore),
        jsonText(verified.artifactIds),
        jsonText(verified.artifactNames),
        jsonText(verified),
        jsonText(body.trace),
        body.appVersion ? jsonText(body.appVersion) : null,
        ipHash,
        ip
      )
      .first<RunRow>();
    if (!run) throw new Error("run_write_failed");

    const sharePayload: LeaderboardSharePayload = {
      seed: verified.seed,
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
      threshold: Math.round(verified.threshold)
    };

    const entryId = randomId();
    const entry = await context.env.DB.prepare(
      `insert into leaderboard_entries
         (id, run_id, nickname, score, year, threshold, seed, artifact_count, app_version, share_payload)
       values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
       on conflict(run_id) do update set
         nickname = excluded.nickname,
         score = excluded.score,
         year = excluded.year,
         threshold = excluded.threshold,
         seed = excluded.seed,
         artifact_count = excluded.artifact_count,
         app_version = excluded.app_version,
         share_payload = excluded.share_payload
       returning id, run_id, nickname, score, year, threshold, seed, artifact_count, app_version, share_payload, created_at`
    )
      .bind(
        entryId,
        run.id,
        nickname,
        Math.round(verified.totalScore),
        verified.year,
        Math.round(verified.threshold),
        verified.seed,
        verified.artifactIds.length,
        body.appVersion ? jsonText(body.appVersion) : null,
        jsonText(sharePayload)
      )
      .first<LeaderboardRow>();
    if (!entry) throw new Error("leaderboard_write_failed");

    const rank = await leaderboardRank(context.env.DB, entry.score, entry.year, entry.created_at);
    const responseSharePayload = {
      ...(parseJsonField<LeaderboardSharePayload>(entry.share_payload) ?? sharePayload),
      rank
    };

    return jsonResponse({
      ok: true,
      entry: {
        id: entry.id,
        runId: entry.run_id,
        nickname: entry.nickname,
        score: entry.score,
        rank,
        year: entry.year,
        threshold: entry.threshold,
        seed: entry.seed,
        artifactCount: entry.artifact_count,
        createdAt: entry.created_at,
        appVersion: parseJsonField(entry.app_version) ?? responseSharePayload.appVersion,
        share: responseSharePayload
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "verify_failed";
    const status = message.endsWith("_mismatch") || message.startsWith("invalid_") ? 400 : 500;
    console.error("verify_failed", error);
    return sendError(status, message);
  }
}

async function leaderboardRank(db: D1Database, score: number, year: number, createdAt: string): Promise<number> {
  if (score < 0) {
    return (
      (await countEntries(
        db,
        `select coalesce(sum(count), 0) as count
         from (
           select count(*) as count from leaderboard_entries where score < ?1
           union all
           select count(*) as count from leaderboard_entries where score = ?1 and created_at < ?2
         )`,
        score,
        createdAt
      )) + 1
    );
  }

  if (year > 1) {
    return (
      (await countEntries(
        db,
        `select coalesce(sum(count), 0) as count
         from (
           select count(*) as count
           from leaderboard_entries as entry
           where entry.score >= 0
             and entry.year > 1
             and not exists (
               select 1
               from leaderboard_entries as higher
               where higher.score >= 0
                 and higher.year > entry.year
                 and ${leaderboardRootSeedSql("higher")} = ${leaderboardRootSeedSql("entry")}
             )
             and entry.year > ?1
           union all
           select count(*) as count
           from leaderboard_entries as entry
           where entry.score >= 0
             and entry.year > 1
             and not exists (
               select 1
               from leaderboard_entries as higher
               where higher.score >= 0
                 and higher.year > entry.year
                 and ${leaderboardRootSeedSql("higher")} = ${leaderboardRootSeedSql("entry")}
             )
             and entry.year = ?1
             and entry.score > ?2
           union all
           select count(*) as count
           from leaderboard_entries as entry
           where entry.score >= 0
             and entry.year > 1
             and not exists (
               select 1
               from leaderboard_entries as higher
               where higher.score >= 0
                 and higher.year > entry.year
                 and ${leaderboardRootSeedSql("higher")} = ${leaderboardRootSeedSql("entry")}
             )
             and entry.year = ?1
             and entry.score = ?2
             and entry.created_at < ?3
         )`,
        year,
        score,
        createdAt
      )) + 1
    );
  }

  return (
    (await countEntries(
      db,
      `select coalesce(sum(count), 0) as count
         from (
         select count(*) as count from leaderboard_entries where year = 1 and score >= 0 and score > ?1
         union all
         select count(*) as count from leaderboard_entries where year = 1 and score >= 0 and score = ?1 and created_at < ?2
       )`,
      score,
      createdAt
    )) + 1
  );
}

async function countEntries(db: D1Database, sql: string, ...bindings: D1Value[]): Promise<number> {
  const row = await db.prepare(sql).bind(...bindings).first<{ count: number }>();
  return row?.count ?? 0;
}

function leaderboardRootSeedSql(alias: string): string {
  return `case when instr(${alias}.seed, '-Y2') > 0 then substr(${alias}.seed, 1, instr(${alias}.seed, '-Y2') - 1) else ${alias}.seed end`;
}
