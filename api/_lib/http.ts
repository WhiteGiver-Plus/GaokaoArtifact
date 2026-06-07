import crypto from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export function requireMethod(req: VercelRequest, res: VercelResponse, method: string): boolean {
  if (req.method === method) return true;
  res.setHeader("allow", method);
  res.status(405).json({ ok: false, error: "method_not_allowed" });
  return false;
}

export function readJsonBody<T>(req: VercelRequest): T {
  if (typeof req.body === "string") return JSON.parse(req.body) as T;
  if (req.body && typeof req.body === "object") return req.body as T;
  return {} as T;
}

export function sendError(res: VercelResponse, status: number, error: string): void {
  res.status(status).json({ ok: false, error });
}

export function hashText(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function stableJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

export function clientIpHash(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return hashText(`${ip ?? "unknown"}:${process.env.LEADERBOARD_SALT ?? "dev"}`);
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
