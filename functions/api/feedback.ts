import type { FeedbackRequest } from "../../gh_pages_local_game/src/core/trace.js";
import { reviewNickname, sanitizeNickname } from "../../gh_pages_local_game/src/core/moderation.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { clientIp, clientIpHash, jsonResponse, jsonText, randomId, readJsonBody, sendError } from "./_lib/http.js";
import type { HandlerContext } from "./_lib/types.js";

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  try {
    const body = await readJsonBody<FeedbackRequest>(context.request);
    const message = body.message?.trim();
    if (!body.sessionId || !message || message.length > 2000) {
      return sendError(400, "invalid_feedback_request");
    }

    const nicknameReview = reviewNickname(body.nickname);
    if (!nicknameReview.ok) {
      return sendError(400, nicknameReview.error ?? "invalid_nickname");
    }

    const ip = clientIp(context.request).slice(0, 120);
    const ipHash = await clientIpHash(context.request, context.env);
    const allowed = await checkRateLimit(context.env.DB, {
      scope: "feedback",
      ipHash,
      max: 8,
      windowSeconds: 10 * 60
    });
    if (!allowed) return sendError(429, "rate_limited");

    const id = randomId();
    const nickname = typeof body.nickname === "string" && body.nickname.trim() ? sanitizeNickname(body.nickname) : null;
    await context.env.DB.prepare(
      `insert into feedback
         (id, session_id, nickname, contact, message, page_path, run_id, seed, decision_trace, app_version, ip_hash, ip)
       values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
    )
      .bind(
        id,
        body.sessionId.slice(0, 120),
        nickname,
        body.contact?.trim().slice(0, 160) || null,
        message,
        body.page?.slice(0, 300) || null,
        body.runId || null,
        body.seed?.slice(0, 200) || null,
        body.trace ? jsonText(body.trace) : null,
        body.appVersion ? jsonText(body.appVersion) : null,
        ipHash,
        ip
      )
      .run();

    return jsonResponse({ ok: true, id });
  } catch (error) {
    console.error("feedback_failed", error);
    return sendError(500, "feedback_failed");
  }
}
