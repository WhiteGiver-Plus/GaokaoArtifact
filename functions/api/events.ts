import type { EventsRequest } from "../../gh_pages_local_game/src/core/trace.js";
import { clientIpHash, jsonResponse, jsonText, nowIso, randomId, readJsonBody, sendError } from "./_lib/http.js";
import type { D1PreparedStatement, HandlerContext } from "./_lib/types.js";

const MAX_EVENTS_PER_BATCH = 32;
const DEFAULT_RAW_SAMPLE_RATE = 0.1;

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  try {
    const body = await readJsonBody<EventsRequest>(context.request);
    if (!body.sessionId || !Array.isArray(body.events)) {
      return sendError(400, "invalid_events_request");
    }

    const events = body.events
      .slice(0, MAX_EVENTS_PER_BATCH)
      .filter((event) => typeof event.name === "string" && event.name.length <= 80);
    if (events.length === 0) return jsonResponse({ ok: true });

    const ipHash = await clientIpHash(context.request, context.env);
    const sampleRate = rawSampleRate(context.env.EVENT_RAW_SAMPLE_RATE);
    const now = nowIso();
    const statements: D1PreparedStatement[] = [];

    for (const event of events) {
      const pagePath =
        typeof event.properties?.path === "string" ? event.properties.path.slice(0, 300) : "";
      const occurredAt = normalizeTimestamp(event.timestamp) ?? now;
      const day = occurredAt.slice(0, 10);
      const appCommit = body.appVersion?.commit ?? "";

      statements.push(
        context.env.DB.prepare(
          `insert into analytics_event_counts
             (day, event_name, page_path, app_commit, count, first_seen_at, last_seen_at)
           values (?1, ?2, ?3, ?4, 1, ?5, ?5)
           on conflict(day, event_name, page_path, app_commit) do update set
             count = count + 1,
             last_seen_at = excluded.last_seen_at`
        ).bind(day, event.name, pagePath, appCommit, now)
      );

      if (Math.random() < sampleRate) {
        statements.push(
          context.env.DB.prepare(
            `insert into analytics_events
               (id, session_id, event_name, page_path, payload, occurred_at, app_version, ip_hash, created_at)
             values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
          ).bind(
            randomId(),
            body.sessionId.slice(0, 120),
            event.name,
            pagePath || null,
            jsonText(event.properties ?? {}),
            occurredAt,
            body.appVersion ? jsonText(body.appVersion) : null,
            ipHash,
            now
          )
        );
      }
    }

    if (statements.length > 0) {
      await context.env.DB.batch(statements);
    }
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("events_failed", error);
    return sendError(500, "events_failed");
  }
}

function normalizeTimestamp(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function rawSampleRate(value: string | undefined): number {
  if (!value) return DEFAULT_RAW_SAMPLE_RATE;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_RAW_SAMPLE_RATE;
  return Math.min(1, Math.max(0, parsed));
}
