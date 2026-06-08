export type D1Value = string | number | boolean | null | ArrayBuffer | ArrayBufferView;

export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: unknown;
}

export interface D1PreparedStatement {
  bind(...values: D1Value[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<Array<D1Result<T>>>;
}

export interface Env {
  DB: D1Database;
  LEADERBOARD_SALT?: string;
  EVENT_RAW_SAMPLE_RATE?: string;
}

export interface HandlerContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil(promise: Promise<unknown>): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
  data: Record<string, unknown>;
}
