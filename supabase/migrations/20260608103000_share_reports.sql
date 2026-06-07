create table if not exists public.share_reports (
  id uuid primary key default gen_random_uuid(),
  share_code text not null unique check (char_length(share_code) between 6 and 16),
  session_id text not null,
  source text not null default 'result' check (source in ('result', 'leaderboard')),
  run_id uuid references public.runs(id) on delete set null,
  player_name text not null,
  rank integer check (rank is null or rank >= 1),
  payload jsonb not null,
  app_version jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists share_reports_code_idx on public.share_reports(share_code);
create index if not exists share_reports_run_id_idx on public.share_reports(run_id);
create index if not exists share_reports_created_at_idx on public.share_reports(created_at desc);
create index if not exists share_reports_app_version_commit_idx
  on public.share_reports ((app_version->>'commit'));

alter table public.share_reports enable row level security;
