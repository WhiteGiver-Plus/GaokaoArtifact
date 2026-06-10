create index if not exists leaderboard_entries_high_score_idx
  on leaderboard_entries(score desc, created_at asc)
  where score >= 0;
