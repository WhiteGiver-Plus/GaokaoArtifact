import type { LeaderboardPeriod, LeaderboardSharePayload } from "../../gh_pages_local_game/src/core/trace.js";
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

type ApiLeaderboardPeriod = LeaderboardPeriod | "all";

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const page = clampNumber(url.searchParams.get("page"), 1, 1, 20);
    const pageSize = clampNumber(url.searchParams.get("pageSize"), 10, 1, 50);
    const period = parsePeriod(url.searchParams.get("period"));
    const offset = (page - 1) * pageSize;

    const where =
      period === "standard"
        ? "where entry.year = 1 and entry.score >= 0"
        : period === "standard-hourly"
          ? `where entry.year = 1
             and entry.score >= 0
             and entry.created_at >= strftime('%Y-%m-%dT%H:00:00.000Z', 'now')`
        : period === "endless"
          ? `where entry.year > 1
             and entry.score >= 0
             and not exists (
               select 1
               from leaderboard_entries as higher
               where higher.score >= 0
                 and higher.year > entry.year
                 and ${leaderboardRootSeedSql("higher")} = ${leaderboardRootSeedSql("entry")}
             )`
          : period === "endless-hourly"
            ? `where entry.year > 1
               and entry.score >= 0
               and entry.created_at >= strftime('%Y-%m-%dT%H:00:00.000Z', 'now')
               and not exists (
                 select 1
                 from leaderboard_entries as higher
                 where higher.score >= 0
                   and higher.year > entry.year
                   and higher.created_at >= strftime('%Y-%m-%dT%H:00:00.000Z', 'now')
                   and ${leaderboardRootSeedSql("higher")} = ${leaderboardRootSeedSql("entry")}
               )`
          : period === "negative"
            ? "where entry.score < 0"
            : "";
    const orderBy =
      period === "negative"
        ? "order by entry.score asc, entry.created_at asc"
        : period === "endless" || period === "endless-hourly"
        ? "order by entry.year desc, entry.score desc, entry.created_at asc"
        : period === "standard" || period === "standard-hourly"
          ? "order by entry.score desc, entry.created_at asc"
          : "order by entry.score desc, entry.year desc, entry.created_at asc";

    const rows = await context.env.DB.prepare(
      `select entry.id, entry.run_id, entry.nickname, entry.score, entry.year, entry.threshold, entry.seed,
              entry.artifact_count, entry.app_version, entry.share_payload, entry.created_at
       from leaderboard_entries as entry
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

function parsePeriod(value: string | null): ApiLeaderboardPeriod {
  if (
    value === "endless" ||
    value === "negative" ||
    value === "all" ||
    value === "standard-hourly" ||
    value === "endless-hourly"
  ) {
    return value;
  }
  return value === "negative-endless" ? "negative" : "standard";
}

function leaderboardRootSeedSql(alias: string): string {
  return `case when instr(${alias}.seed, '-Y2') > 0 then substr(${alias}.seed, 1, instr(${alias}.seed, '-Y2') - 1) else ${alias}.seed end`;
}
