create table if not exists session_landing_sources (
  session_id text primary key,
  first_page_path text,
  first_landing_url text,
  first_referrer text,
  first_source text,
  first_share_code text,
  first_has_compact_share integer not null default 0,
  first_seen_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_page_path text,
  last_landing_url text,
  last_referrer text,
  last_source text,
  last_share_code text,
  last_has_compact_share integer not null default 0,
  last_seen_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  open_count integer not null default 1
);

create table if not exists session_referral_edges (
  from_session_id text not null,
  to_session_id text not null,
  share_code text not null,
  source text not null default 'result' check (source in ('result', 'leaderboard')),
  first_seen_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  open_count integer not null default 1,
  primary key (from_session_id, to_session_id, share_code)
);

create index if not exists session_landing_sources_source_idx
  on session_landing_sources(last_source, last_seen_at desc);
create index if not exists session_landing_sources_share_code_idx
  on session_landing_sources(last_share_code);
create index if not exists session_referral_edges_from_idx
  on session_referral_edges(from_session_id, last_seen_at desc);
create index if not exists session_referral_edges_to_idx
  on session_referral_edges(to_session_id, last_seen_at desc);
create index if not exists session_referral_edges_share_code_idx
  on session_referral_edges(share_code, last_seen_at desc);
