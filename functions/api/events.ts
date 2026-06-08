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
    const sessionId = body.sessionId.slice(0, 120);

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
            sessionId,
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

      if (event.name === "page_view") {
        statements.push(
          context.env.DB.prepare(
            `insert into session_landing_sources
               (session_id, first_page_path, first_landing_url, first_referrer, first_source,
                first_share_code, first_has_compact_share, first_seen_at,
                last_page_path, last_landing_url, last_referrer, last_source,
                last_share_code, last_has_compact_share, last_seen_at, open_count)
             values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 1)
             on conflict(session_id) do update set
               last_page_path = excluded.last_page_path,
               last_landing_url = excluded.last_landing_url,
               last_referrer = excluded.last_referrer,
               last_source = excluded.last_source,
               last_share_code = excluded.last_share_code,
               last_has_compact_share = excluded.last_has_compact_share,
               last_seen_at = excluded.last_seen_at,
               open_count = session_landing_sources.open_count + 1`
          ).bind(
            sessionId,
            pagePath || null,
            textProperty(event.properties, "landingUrl", 600),
            textProperty(event.properties, "referrer", 500),
            textProperty(event.properties, "source", 120) ?? "direct",
            shareCodeProperty(event.properties),
            booleanProperty(event.properties, "hasCompactShare") ? 1 : 0,
            occurredAt
          )
        );

        const shareCode = shareCodeProperty(event.properties);
        if (shareCode) {
          const parent = await context.env.DB.prepare(
            "select session_id, source from share_reports where share_code = ?1"
          )
            .bind(shareCode)
            .first<{ session_id: string; source: "result" | "leaderboard" }>();
          if (parent?.session_id && parent.session_id !== sessionId) {
            statements.push(
              context.env.DB.prepare(
                `insert into session_referral_edges
                   (from_session_id, to_session_id, share_code, source, first_seen_at, last_seen_at, open_count)
                 values (?1, ?2, ?3, ?4, ?5, ?5, 1)
                 on conflict(from_session_id, to_session_id, share_code) do update set
                   last_seen_at = excluded.last_seen_at,
                   open_count = session_referral_edges.open_count + 1`
              ).bind(parent.session_id.slice(0, 120), sessionId, shareCode, parent.source, occurredAt)
            );
          }
        }
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

function textProperty(properties: Record<string, unknown> | undefined, key: string, maxLength: number): string | null {
  const value = properties?.[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function booleanProperty(properties: Record<string, unknown> | undefined, key: string): boolean {
  return properties?.[key] === true;
}

function shareCodeProperty(properties: Record<string, unknown> | undefined): string | null {
  const value = textProperty(properties, "shareCode", 16);
  return value && /^[0-9A-Za-z]{6,16}$/.test(value) ? value : null;
}
