create table if not exists analytics_event_counts (
  day text not null,
  event_name text not null,
  page_path text not null default '',
  app_commit text not null default '',
  count integer not null default 0,
  first_seen_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  primary key (day, event_name, page_path, app_commit)
);

create table if not exists analytics_events (
  id text primary key,
  session_id text not null,
  event_name text not null,
  page_path text,
  payload text not null default '{}',
  occurred_at text,
  app_version text,
  ip_hash text,
  sampled integer not null default 1,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists feedback (
  id text primary key,
  session_id text not null,
  nickname text,
  contact text,
  message text not null check (length(message) between 1 and 2000),
  page_path text,
  run_id text,
  seed text,
  decision_trace text,
  app_version text,
  status text not null default 'open',
  ip_hash text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists runs (
  id text primary key,
  trace_hash text not null unique,
  session_id text not null,
  nickname text not null,
  seed text not null,
  subjects text not null,
  year integer not null check (year >= 1),
  threshold integer not null check (threshold >= 750),
  total_score integer not null,
  artifact_ids text not null,
  artifact_names text not null,
  result_payload text not null,
  decision_trace text not null,
  app_version text,
  ip_hash text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists leaderboard_entries (
  id text primary key,
  run_id text not null unique references runs(id) on delete cascade,
  nickname text not null,
  score integer not null,
  year integer not null check (year >= 1),
  threshold integer not null check (threshold >= 750),
  seed text not null,
  artifact_count integer not null default 0,
  app_version text,
  share_payload text not null default '{}',
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists share_reports (
  id text primary key,
  share_code text not null unique check (length(share_code) between 6 and 16),
  session_id text not null,
  source text not null default 'result' check (source in ('result', 'leaderboard')),
  run_id text references runs(id) on delete set null,
  player_name text not null,
  rank integer check (rank is null or rank >= 1),
  payload text not null,
  app_version text,
  ip_hash text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists _rate_limit (
  key text primary key,
  bucket text not null,
  window_start text not null,
  count integer not null default 0,
  updated_at text not null
);

create index if not exists analytics_event_counts_day_idx
  on analytics_event_counts(day desc, count desc);
create index if not exists analytics_events_created_at_idx on analytics_events(created_at desc);
create index if not exists analytics_events_name_created_at_idx on analytics_events(event_name, created_at desc);
create index if not exists feedback_created_at_idx on feedback(created_at desc);
create index if not exists feedback_seed_idx on feedback(seed);
create index if not exists runs_seed_idx on runs(seed);
create index if not exists runs_total_score_idx on runs(total_score desc, created_at asc);
create index if not exists leaderboard_entries_standard_idx
  on leaderboard_entries(year, score desc, created_at asc);
create index if not exists leaderboard_entries_endless_idx
  on leaderboard_entries(year desc, score desc, created_at asc);
create index if not exists share_reports_code_idx on share_reports(share_code);
create index if not exists share_reports_run_id_idx on share_reports(run_id);
create index if not exists share_reports_created_at_idx on share_reports(created_at desc);
create index if not exists rate_limit_updated_at_idx on _rate_limit(updated_at);
