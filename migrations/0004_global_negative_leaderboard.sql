drop index if exists leaderboard_entries_negative_endless_idx;

create index if not exists leaderboard_entries_negative_idx
  on leaderboard_entries(score asc, created_at asc)
  where score < 0;
