-- Kolkata Startup Map backend hardening
create index if not exists startups_status_last_checked_idx
  on public.startups(status, last_checked_at desc);
create index if not exists startups_hiring_checked_idx
  on public.startups(hiring_status, hiring_checked_at desc);
create index if not exists jobs_last_seen_status_idx
  on public.jobs(status, last_seen_at desc);
create index if not exists source_checks_startup_checked_idx
  on public.source_checks(startup_id, checked_at desc);
create index if not exists source_checks_type_checked_idx
  on public.source_checks(source_type, checked_at desc);
create index if not exists news_items_status_published_idx
  on public.news_items(status, published_at desc);
create index if not exists submissions_status_created_idx
  on public.submissions(status, created_at desc);

comment on table public.startups is
  'Kolkata ecosystem directory. status=needs_review means discovered but not yet approved for public display.';
comment on column public.startups.verified is
  'True only when the listing has been independently verified from a public source.';
comment on column public.startups.location_confidence is
  'Confidence of the map coordinates; approximate coordinates must not be presented as an exact office address.';
