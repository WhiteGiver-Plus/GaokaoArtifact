create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  page_path text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  nickname text,
  contact text,
  message text not null check (char_length(message) between 1 and 2000),
  page_path text,
  run_id uuid,
  status text not null default 'open',
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  trace_hash text not null unique,
  session_id text not null,
  nickname text not null,
  seed text not null,
  subjects jsonb not null,
  year integer not null check (year >= 1),
  threshold integer not null check (threshold >= 750),
  total_score integer not null,
  artifact_ids jsonb not null,
  artifact_names jsonb not null,
  result_payload jsonb not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references public.runs(id) on delete cascade,
  nickname text not null,
  score integer not null,
  year integer not null check (year >= 1),
  threshold integer not null check (threshold >= 750),
  seed text not null,
  artifact_count integer not null default 0,
  share_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx on public.analytics_events(created_at desc);
create index if not exists analytics_events_name_created_at_idx on public.analytics_events(event_name, created_at desc);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
create index if not exists runs_total_score_idx on public.runs(total_score desc, created_at asc);
create index if not exists leaderboard_entries_score_idx on public.leaderboard_entries(score desc, year desc, created_at asc);

alter table public.analytics_events enable row level security;
alter table public.feedback enable row level security;
alter table public.runs enable row level security;
alter table public.leaderboard_entries enable row level security;
