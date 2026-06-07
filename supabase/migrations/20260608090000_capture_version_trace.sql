alter table public.analytics_events
  add column if not exists app_version jsonb;

alter table public.feedback
  add column if not exists seed text,
  add column if not exists decision_trace jsonb,
  add column if not exists app_version jsonb;

alter table public.runs
  add column if not exists decision_trace jsonb,
  add column if not exists app_version jsonb;

alter table public.leaderboard_entries
  add column if not exists app_version jsonb;

create index if not exists analytics_events_app_version_commit_idx
  on public.analytics_events ((app_version->>'commit'));

create index if not exists feedback_seed_idx on public.feedback(seed);
create index if not exists feedback_app_version_commit_idx
  on public.feedback ((app_version->>'commit'));

create index if not exists runs_seed_idx on public.runs(seed);
create index if not exists runs_app_version_commit_idx
  on public.runs ((app_version->>'commit'));

create index if not exists leaderboard_entries_app_version_commit_idx
  on public.leaderboard_entries ((app_version->>'commit'));
