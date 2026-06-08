create index if not exists leaderboard_entries_negative_endless_idx
  on leaderboard_entries(score asc, created_at asc)
  where year > 1 and score < 0;
