import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clientIpHash, readJsonBody, requireMethod, sendError } from "./_lib/http.js";
import { getSupabase } from "./_lib/supabase.js";
import type { FeedbackRequest } from "../gh_pages_local_game/src/core/trace.js";
import { reviewNickname, sanitizeNickname } from "../gh_pages_local_game/src/core/moderation.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!requireMethod(req, res, "POST")) return;
  try {
    const body = readJsonBody<FeedbackRequest>(req);
    const message = body.message?.trim();
    if (!body.sessionId || !message || message.length > 2000) {
      sendError(res, 400, "invalid_feedback_request");
      return;
    }
    const nicknameReview = reviewNickname(body.nickname);
    if (!nicknameReview.ok) {
      sendError(res, 400, nicknameReview.error ?? "invalid_nickname");
      return;
    }
    const nickname = typeof body.nickname === "string" && body.nickname.trim() ? sanitizeNickname(body.nickname) : null;
    const { data, error } = await getSupabase()
      .from("feedback")
      .insert({
        session_id: body.sessionId.slice(0, 120),
        nickname,
        contact: body.contact?.trim().slice(0, 160) || null,
        message,
        page_path: body.page?.slice(0, 300) || null,
        run_id: body.runId || null,
        seed: body.seed?.slice(0, 200) || null,
        decision_trace: body.trace ?? null,
        app_version: body.appVersion ?? null,
        ip_hash: clientIpHash(req)
      })
      .select("id")
      .single();
    if (error) throw error;
    res.status(200).json({ ok: true, id: data.id });
  } catch (error) {
    sendError(res, error instanceof Error && error.message === "missing_supabase_env" ? 503 : 500, "feedback_failed");
  }
}
