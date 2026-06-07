import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clientIpHash, readJsonBody, requireMethod, sendError } from "./_lib/http.js";
import { getSupabase } from "./_lib/supabase.js";
import type { EventsRequest } from "../gh_pages_local_game/src/core/trace.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!requireMethod(req, res, "POST")) return;
  try {
    const body = readJsonBody<EventsRequest>(req);
    if (!body.sessionId || !Array.isArray(body.events)) {
      sendError(res, 400, "invalid_events_request");
      return;
    }
    const events = body.events.slice(0, 32).filter((event) => typeof event.name === "string" && event.name.length <= 80);
    if (events.length === 0) {
      res.status(200).json({ ok: true });
      return;
    }
    const ipHash = clientIpHash(req);
    const rows = events.map((event) => ({
      session_id: body.sessionId.slice(0, 120),
      event_name: event.name,
      page_path: typeof event.properties?.path === "string" ? event.properties.path.slice(0, 300) : null,
      payload: event.properties ?? {},
      occurred_at: event.timestamp,
      app_version: body.appVersion ?? null,
      ip_hash: ipHash
    }));
    const { error } = await getSupabase().from("analytics_events").insert(rows);
    if (error) throw error;
    res.status(200).json({ ok: true });
  } catch (error) {
    sendError(res, error instanceof Error && error.message === "missing_supabase_env" ? 503 : 500, "events_failed");
  }
}
