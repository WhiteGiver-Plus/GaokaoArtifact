import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clientIpHash, readJsonBody, sendError } from "./_lib/http.js";
import { getSupabase } from "./_lib/supabase.js";
import type { CreateShareRequest, ShareReportPayload } from "../gh_pages_local_game/src/core/trace.js";

const CODE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const SHARE_CODE_LENGTH = 8;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === "POST") {
    await createShare(req, res);
    return;
  }
  if (req.method === "GET") {
    await readShare(req, res);
    return;
  }
  res.setHeader("allow", "GET, POST");
  sendError(res, 405, "method_not_allowed");
}

async function createShare(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const body = readJsonBody<CreateShareRequest>(req);
    if (!body.sessionId || !body.report) {
      sendError(res, 400, "invalid_share_request");
      return;
    }
    const report = normalizeShareReport(body.report, body.rank);
    if (!report) {
      sendError(res, 400, "invalid_share_report");
      return;
    }

    const supabase = getSupabase();
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const code = createShareCode();
      const { data, error } = await supabase
        .from("share_reports")
        .insert({
          share_code: code,
          session_id: body.sessionId.slice(0, 120),
          source: body.source === "leaderboard" ? "leaderboard" : "result",
          run_id: uuidOrNull(body.runId),
          player_name: report.playerName,
          rank: report.rank ?? null,
          payload: report,
          app_version: body.appVersion ?? null,
          ip_hash: clientIpHash(req)
        })
        .select("share_code, payload")
        .single();
      if (!error && data) {
        res.status(200).json({ ok: true, code: data.share_code, report: data.payload });
        return;
      }
      if (!isUniqueViolation(error)) throw error;
    }
    sendError(res, 500, "share_code_exhausted");
  } catch (error) {
    sendError(res, error instanceof Error && error.message === "missing_supabase_env" ? 503 : 500, "share_create_failed");
  }
}

async function readShare(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const code = normalizeShareCode(Array.isArray(req.query.code) ? req.query.code[0] : req.query.code);
    if (!code) {
      sendError(res, 400, "invalid_share_code");
      return;
    }
    const { data, error } = await getSupabase()
      .from("share_reports")
      .select("share_code, payload, rank")
      .eq("share_code", code)
      .single();
    if (error || !data) {
      sendError(res, 404, "share_not_found");
      return;
    }
    const report = normalizeShareReport(data.payload, data.rank ?? undefined);
    if (!report) {
      sendError(res, 500, "share_payload_invalid");
      return;
    }
    res.status(200).json({ ok: true, code: data.share_code, report });
  } catch (error) {
    sendError(res, error instanceof Error && error.message === "missing_supabase_env" ? 503 : 500, "share_read_failed");
  }
}

function normalizeShareReport(value: unknown, rank?: number): ShareReportPayload | undefined {
  if (!value || typeof value !== "object") return undefined;
  const report = value as Partial<ShareReportPayload>;
  const playerName = normalizeText(report.playerName, 32);
  const seed = normalizeText(report.seed, 120);
  const score = normalizeInteger(report.score, 0, Number.MAX_SAFE_INTEGER);
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
          const scoreValue = typeof subject.scoreValue === "number" && Number.isFinite(subject.scoreValue)
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

function normalizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim().replace(/\s+/g, " ").slice(0, maxLength);
  return text || undefined;
}

function normalizeInteger(value: unknown, min: number, max: number): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(max, Math.max(min, Math.round(parsed)));
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
  const bytes = crypto.randomBytes(SHARE_CODE_LENGTH);
  return [...bytes].map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}
