import type { Env } from "./types.js";

const textEncoder = new TextEncoder();

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export function sendError(status: number, error: string): Response {
  return jsonResponse({ ok: false, error }, status);
}

export function methodNotAllowed(methods: string[]): Response {
  return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
    status: 405,
    headers: {
      allow: methods.join(", "),
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return {} as T;
  return (await request.json().catch(() => ({}))) as T;
}

export async function hashText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function clientIpHash(request: Request, env: Env): Promise<string> {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return hashText(`${ip}:${leaderboardSalt(env)}`);
}

export function leaderboardSalt(env: Env): string {
  return env.LEADERBOARD_SALT?.trim() || "dev";
}

export function stableJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

export function jsonText(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function parseJsonField<T>(value: unknown): T | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function normalizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim().replace(/\s+/g, " ").slice(0, maxLength);
  return text || undefined;
}

export function normalizeInteger(value: unknown, min: number, max: number): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function randomId(): string {
  return crypto.randomUUID();
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortJson(item)])
  );
}
