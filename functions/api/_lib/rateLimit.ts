import { nowIso } from "./http.js";
import type { D1Database } from "./types.js";

interface RateLimitOptions {
  scope: string;
  ipHash: string;
  max: number;
  windowSeconds: number;
}

export async function checkRateLimit(db: D1Database, options: RateLimitOptions): Promise<boolean> {
  const bucket = String(Math.floor(Date.now() / 1000 / options.windowSeconds));
  const key = `${options.scope}:${options.ipHash}`;
  const row = await db
    .prepare("select window_start, count from _rate_limit where key = ?1")
    .bind(key)
    .first<{ window_start: string; count: number }>();

  if (row?.window_start === bucket) {
    if (row.count >= options.max) return false;
    await db
      .prepare("update _rate_limit set count = count + 1, updated_at = ?2 where key = ?1")
      .bind(key, nowIso())
      .run();
    return true;
  }

  await db
    .prepare(
      `insert into _rate_limit (key, bucket, window_start, count, updated_at)
       values (?1, ?2, ?3, 1, ?4)
       on conflict(key) do update set
         bucket = excluded.bucket,
         window_start = excluded.window_start,
         count = 1,
         updated_at = excluded.updated_at`
    )
    .bind(key, options.scope, bucket, nowIso())
    .run();
  return true;
}
