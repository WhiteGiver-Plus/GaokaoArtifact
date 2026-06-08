import type { CreateShareRequest, ShareReportPayload } from "../../gh_pages_local_game/src/core/trace.js";
import {
  clientIp,
  clientIpHash,
  jsonResponse,
  jsonText,
  methodNotAllowed,
  normalizeInteger,
  normalizeText,
  parseJsonField,
  randomId,
  readJsonBody,
  sendError
} from "./_lib/http.js";
import type { HandlerContext } from "./_lib/types.js";

const CODE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SHARE_CODE_LENGTH = 8;

interface ShareRow {
  share_code: string;
  payload: string;
  rank: number | null;
}

export async function onRequest(context: HandlerContext): Promise<Response> {
  if (context.request.method === "POST") return createShare(context);
  if (context.request.method === "GET") return readShare(context);
  return methodNotAllowed(["GET", "POST"]);
}

async function createShare(context: HandlerContext): Promise<Response> {
  try {
    const body = await readJsonBody<CreateShareRequest>(context.request);
    if (!body.sessionId || !body.report) {
      return sendError(400, "invalid_share_request");
    }

    const report = normalizeShareReport(body.report, body.rank);
    if (!report) return sendError(400, "invalid_share_report");

    const ip = clientIp(context.request).slice(0, 120);
    const ipHash = await clientIpHash(context.request, context.env);
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = createShareCode();
      try {
        await context.env.DB.prepare(
          `insert into share_reports
             (id, share_code, session_id, source, run_id, player_name, rank, payload, app_version, ip_hash, ip)
           values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
        )
          .bind(
            randomId(),
            code,
            body.sessionId.slice(0, 120),
            body.source === "leaderboard" ? "leaderboard" : "result",
            uuidOrNull(body.runId),
            report.playerName,
            report.rank ?? null,
            jsonText(report),
            body.appVersion ? jsonText(body.appVersion) : null,
            ipHash,
            ip
          )
          .run();
        return jsonResponse({ ok: true, code, report });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
      }
    }

    return sendError(500, "share_code_exhausted");
  } catch (error) {
    console.error("share_create_failed", error);
    return sendError(500, "share_create_failed");
  }
}

async function readShare(context: HandlerContext): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const code = normalizeShareCode(url.searchParams.get("code"));
    if (!code) return sendError(400, "invalid_share_code");

    const row = await context.env.DB.prepare(
      "select share_code, payload, rank from share_reports where share_code = ?1"
    )
      .bind(code)
      .first<ShareRow>();
    if (!row) return sendError(404, "share_not_found");

    const report = normalizeShareReport(parseJsonField(row.payload), row.rank ?? undefined);
    if (!report) return sendError(500, "share_payload_invalid");
    return jsonResponse({ ok: true, code: row.share_code, report });
  } catch (error) {
    console.error("share_read_failed", error);
    return sendError(500, "share_read_failed");
  }
}

function normalizeShareReport(value: unknown, rank?: number): ShareReportPayload | undefined {
  if (!value || typeof value !== "object") return undefined;
  const report = value as Partial<ShareReportPayload>;
  const playerName = normalizeText(report.playerName, 32);
  const seed = normalizeText(report.seed, 120);
  const score = normalizeInteger(report.score, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  const year = normalizeInteger(report.year, 1, 9999);
  const threshold = normalizeInteger(report.threshold, 750, Number.MAX_SAFE_INTEGER);
  const title = normalizeText(report.title, 48);
  if (!playerName || !seed || score === undefined || year === undefined || threshold === undefined || !title) {
    return undefined;
  }
  const subjects = Array.isArray(report.subjects)
    ? report.subjects
        .map((item) => {
          if (!item || typeof item !== "object") return undefined;
          const subject = item as unknown as Record<string, unknown>;
          const label = normalizeText(subject.label, 24);
          const scoreText = normalizeText(subject.score, 24);
          const scoreValue =
            typeof subject.scoreValue === "number" && Number.isFinite(subject.scoreValue)
              ? Math.round(subject.scoreValue)
              : undefined;
          if (!label || !scoreText) return undefined;
          return { label, score: scoreText, ...(scoreValue !== undefined ? { scoreValue } : {}) };
        })
        .filter((item): item is ShareReportPayload["subjects"][number] => Boolean(item))
        .slice(0, 12)
    : [];
  const artifacts = Array.isArray(report.artifacts)
    ? report.artifacts
        .map((item) => normalizeText(item, 80))
        .filter((item): item is string => Boolean(item))
        .slice(0, 120)
    : [];
  const normalizedRank = normalizeInteger(rank ?? report.rank, 1, Number.MAX_SAFE_INTEGER);
  return {
    playerName,
    seed,
    score,
    ...(normalizedRank !== undefined ? { rank: normalizedRank } : {}),
    year,
    threshold,
    title,
    subjects,
    artifacts
  };
}

function normalizeShareCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim();
  return /^[0-9A-Za-z]{6,16}$/.test(code) ? code : undefined;
}

function uuidOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function createShareCode(): string {
  const bytes = new Uint8Array(SHARE_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && error.message.includes("UNIQUE constraint failed");
}
