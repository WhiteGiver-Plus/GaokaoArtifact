alter table public.runs
  alter column threshold type bigint,
  alter column total_score type bigint;

alter table public.leaderboard_entries
  alter column score type bigint,
  alter column threshold type bigint;
