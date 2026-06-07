import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireMethod, sendError } from "./_lib/http.js";
import { getSupabase } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!requireMethod(req, res, "GET")) return;
  try {
    const page = clampNumber(req.query.page, 1, 1, 20);
    const pageSize = clampNumber(req.query.pageSize, 10, 1, 50);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await getSupabase()
      .from("leaderboard_entries")
      .select("id, run_id, nickname, score, year, threshold, seed, artifact_count, app_version, share_payload, created_at")
      .order("score", { ascending: false })
      .order("year", { ascending: false })
      .order("created_at", { ascending: true })
      .range(from, to);
    if (error) throw error;
    res.status(200).json({
      ok: true,
      entries: (data ?? []).map((entry) => ({
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
      }))
    });
  } catch (error) {
    sendError(res, error instanceof Error && error.message === "missing_supabase_env" ? 503 : 500, "leaderboard_failed");
  }
}

function clampNumber(value: string | string[] | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
