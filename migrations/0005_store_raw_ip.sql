alter table analytics_events add column ip text;
alter table feedback add column ip text;
alter table runs add column ip text;
alter table share_reports add column ip text;

alter table session_landing_sources add column first_ip text;
alter table session_landing_sources add column first_ip_hash text;
alter table session_landing_sources add column last_ip text;
alter table session_landing_sources add column last_ip_hash text;
