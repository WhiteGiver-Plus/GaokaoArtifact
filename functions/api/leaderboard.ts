import type { LeaderboardSharePayload } from "../../gh_pages_local_game/src/core/trace.js";
import { jsonResponse, parseJsonField, sendError } from "./_lib/http.js";
import type { HandlerContext } from "./_lib/types.js";

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

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const page = clampNumber(url.searchParams.get("page"), 1, 1, 20);
    const pageSize = clampNumber(url.searchParams.get("pageSize"), 10, 1, 50);
    const period = parsePeriod(url.searchParams.get("period"));
    const offset = (page - 1) * pageSize;

    const where = period === "standard" ? "where year = 1" : period === "endless" ? "where year > 1" : "";
    const orderBy =
      period === "endless"
        ? "order by year desc, score desc, created_at asc"
        : period === "standard"
          ? "order by score desc, created_at asc"
          : "order by score desc, year desc, created_at asc";

    const rows = await context.env.DB.prepare(
      `select id, run_id, nickname, score, year, threshold, seed, artifact_count, app_version, share_payload, created_at
       from leaderboard_entries
       ${where}
       ${orderBy}
       limit ?1 offset ?2`
    )
      .bind(pageSize, offset)
      .all<LeaderboardRow>();

    return jsonResponse({
      ok: true,
      entries: (rows.results ?? []).map((entry, index) => {
        const rank = offset + index + 1;
        const share = parseJsonField<LeaderboardSharePayload>(entry.share_payload);
        const appVersion = parseJsonField(entry.app_version) ?? share?.appVersion;
        return {
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
          appVersion,
          share: share ? { ...share, rank: share.rank ?? rank } : share
        };
      })
    });
  } catch (error) {
    console.error("leaderboard_failed", error);
    return sendError(500, "leaderboard_failed");
  }
}

function clampNumber(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function parsePeriod(value: string | null): "standard" | "endless" | "all" {
  return value === "endless" || value === "all" ? value : "standard";
}
