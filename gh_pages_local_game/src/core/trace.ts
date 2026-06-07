import type { RunResult, SubjectId } from "./types.js";

export const DECISION_TRACE_VERSION = 1;

export interface DecisionTrace {
  version: typeof DECISION_TRACE_VERSION;
  runs: DecisionTraceRun[];
}

export interface AppVersionInfo {
  packageVersion: string;
  commit: string;
  buildTime: string;
  traceVersion: typeof DECISION_TRACE_VERSION;
}

export interface DecisionTraceRun {
  mode: "standard" | "endless";
  seed: string;
  subjects: SubjectId[];
  year: number;
  threshold: number;
  entries: DecisionTraceEntry[];
}

export type DecisionTraceEntry = ArtifactDecisionEntry | ScoreDecisionEntry;

export interface ArtifactDecisionEntry {
  kind: "artifact";
  discard: boolean;
  reason: string;
  offeredIds: string[];
  selectedIndex: number;
}

export interface ScoreDecisionEntry {
  kind: "score";
  mode: "onesDigit" | "digitSwap";
  subject: SubjectId;
  score: number;
  value?: number;
  swap?: [number, number];
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export interface EventsRequest {
  sessionId: string;
  appVersion?: AppVersionInfo;
  events: AnalyticsEvent[];
}

export interface FeedbackRequest {
  sessionId: string;
  nickname?: string;
  contact?: string;
  message: string;
  page?: string;
  runId?: string;
  seed?: string;
  trace?: DecisionTrace;
  appVersion?: AppVersionInfo;
}

export interface VerifyRunRequest {
  sessionId: string;
  nickname?: string;
  trace: DecisionTrace;
  clientResult: RunResult;
  appVersion?: AppVersionInfo;
}

export interface LeaderboardEntry {
  id: string;
  runId: string;
  nickname: string;
  score: number;
  year: number;
  threshold: number;
  seed: string;
  artifactCount: number;
  createdAt: string;
  appVersion?: AppVersionInfo;
  share?: LeaderboardSharePayload;
}

export interface LeaderboardSharePayload {
  seed: string;
  totalScore: number;
  year: number;
  threshold: number;
  appVersion?: AppVersionInfo;
  trace?: DecisionTrace;
  subjects?: SubjectId[];
  exams?: Array<{ subject: SubjectId; score: number }>;
  artifactIds?: string[];
  artifactNames?: string[];
}

export interface VerifyRunResponse {
  ok: boolean;
  entry?: LeaderboardEntry;
  error?: string;
}

export interface LeaderboardResponse {
  ok: boolean;
  entries: LeaderboardEntry[];
  error?: string;
}

export interface FeedbackResponse {
  ok: boolean;
  id?: string;
  error?: string;
}

export function createDecisionTrace(): DecisionTrace {
  return {
    version: DECISION_TRACE_VERSION,
    runs: []
  };
}

export function createDecisionTraceRun(
  mode: DecisionTraceRun["mode"],
  seed: string,
  subjects: SubjectId[],
  year: number,
  threshold: number
): DecisionTraceRun {
  return {
    mode,
    seed,
    subjects: [...subjects],
    year,
    threshold,
    entries: []
  };
}
