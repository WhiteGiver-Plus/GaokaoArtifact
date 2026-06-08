import type {
  AnalyticsEvent,
  CreateShareRequest,
  FeedbackRequest,
  FeedbackResponse,
  LeaderboardResponse,
  ShareReportResponse,
  VerifyRunRequest,
  VerifyRunResponse
} from "../core/trace.js";
import { APP_VERSION } from "../version.js";

const SESSION_KEY = "gaokao-session-id";
const EVENT_BATCH_SIZE = 8;
const EVENT_FLUSH_DELAY_MS = 1200;

let eventQueue: AnalyticsEvent[] = [];
let eventTimer: number | undefined;

export function publicSiteUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return window.location.origin;
}

export function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configured) return "/api";
  return configured.replace(/\/+$/, "");
}

export function sessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function trackEvent(name: string, properties: Record<string, unknown> = {}): void {
  eventQueue.push({
    name,
    properties: {
      path: window.location.pathname,
      ...properties
    },
    timestamp: new Date().toISOString()
  });
  if (eventQueue.length >= EVENT_BATCH_SIZE) {
    void flushEvents();
    return;
  }
  if (eventTimer !== undefined) return;
  eventTimer = window.setTimeout(() => {
    eventTimer = undefined;
    void flushEvents();
  }, EVENT_FLUSH_DELAY_MS);
}

export async function flushEvents(): Promise<void> {
  if (eventTimer !== undefined) {
    window.clearTimeout(eventTimer);
    eventTimer = undefined;
  }
  const events = eventQueue;
  eventQueue = [];
  if (events.length === 0) return;
  if (shouldSkipLocalAnalytics()) return;
  const payload = JSON.stringify({ sessionId: sessionId(), appVersion: APP_VERSION, events });
  const url = `${apiBaseUrl()}/events`;
  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      if (sent) return;
    }
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true
    });
  } catch {
    // Analytics must never interrupt gameplay.
  }
}

function shouldSkipLocalAnalytics(): boolean {
  const hasConfiguredApi = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
  if (hasConfiguredApi) return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "::1";
}

export async function submitFeedback(request: Omit<FeedbackRequest, "sessionId">): Promise<FeedbackResponse> {
  return fetchJson<FeedbackResponse>("/feedback", {
    sessionId: sessionId(),
    appVersion: APP_VERSION,
    ...request
  });
}

export async function verifyRun(request: Omit<VerifyRunRequest, "sessionId">): Promise<VerifyRunResponse> {
  return fetchJson<VerifyRunResponse>("/runs/verify", {
    sessionId: sessionId(),
    appVersion: APP_VERSION,
    ...request
  });
}

export async function loadLeaderboard(period: "standard" | "endless" = "standard"): Promise<LeaderboardResponse> {
  const response = await fetch(`${apiBaseUrl()}/leaderboard?period=${period}&page=1&pageSize=10`);
  if (!response.ok) {
    return { ok: false, entries: [], error: `HTTP ${response.status}` };
  }
  return (await response.json()) as LeaderboardResponse;
}

export async function createShareReport(request: Omit<CreateShareRequest, "sessionId">): Promise<ShareReportResponse> {
  return fetchJson<ShareReportResponse>("/shares", {
    sessionId: sessionId(),
    appVersion: APP_VERSION,
    ...request
  });
}

export async function loadShareReport(code: string): Promise<ShareReportResponse> {
  const response = await fetch(`${apiBaseUrl()}/shares?code=${encodeURIComponent(code)}`);
  if (!response.ok) {
    return { ok: false, error: `HTTP ${response.status}` };
  }
  return (await response.json()) as ShareReportResponse;
}

async function fetchJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) return body;
  return body;
}
