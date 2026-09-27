create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','reviewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website text,
  careers_url text,
  founder text,
  public_email text,
  sector text,
  area text,
  stage text,
  description text,
  linkedin_url text,
  lat double precision,
  lng double precision,
  location_confidence text not null default 'approximate',
  verified boolean not null default false,
  status text not null default 'approved' check (status in ('pending','approved','rejected','needs_review')),
  source_url text,
  logo_url text,
  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists startups_status_idx on public.startups(status);
create index if not exists startups_area_idx on public.startups(area);
create index if not exists startups_sector_idx on public.startups(sector);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  title text not null,
  location text,
  mode text,
  employment_type text,
  fresher boolean not null default false,
  apply_url text not null,
  source_url text,
  external_id text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  status text not null default 'live' check (status in ('live','stale','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(startup_id, external_id)
);

create index if not exists jobs_startup_idx on public.jobs(startup_id);
create index if not exists jobs_status_idx on public.jobs(status);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  startup_name text not null,
  website text not null,
  founder text,
  email text,
  sector text,
  locality text,
  description text,
  linkedin_url text,
  careers_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','needs_review')),
  reviewer_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.submissions(status);
create index if not exists submissions_created_idx on public.submissions(created_at desc);

create table if not exists public.source_checks (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid references public.startups(id) on delete cascade,
  source_url text not null,
  source_type text not null,
  checked_at timestamptz not null default now(),
  http_status integer,
  jobs_found integer not null default 0,
  success boolean not null default false,
  error text
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

alter table public.startups enable row level security;
alter table public.jobs enable row level security;
alter table public.submissions enable row level security;
alter table public.source_checks enable row level security;
alter table public.audit_log enable row level security;
alter table public.admin_users enable row level security;

create policy "public can read approved startups" on public.startups for select using (status = 'approved');
create policy "public can read live jobs" on public.jobs for select using (
  status = 'live' and exists (select 1 from public.startups s where s.id = startup_id and s.status = 'approved')
);
create policy "public can submit startups" on public.submissions for insert with check (status = 'pending');
create policy "admins manage startups" on public.startups for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage jobs" on public.jobs for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage submissions" on public.submissions for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read checks" on public.source_checks for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit" on public.audit_log for select using (public.is_admin());
create policy "admins read admin users" on public.admin_users for select using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger startups_updated_at before update on public.startups
for each row execute function public.set_updated_at();

create trigger jobs_updated_at before update on public.jobs
for each row execute function public.set_updated_at();
