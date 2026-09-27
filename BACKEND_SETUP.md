# Backend setup

The repository now contains the full backend layer for Kolkata Startup Map.

## 1. Connect Supabase

Create/connect a Supabase project and run:

- `supabase/migrations/001_initial.sql`

This creates startups, jobs, submissions, source checks, audit logs, admin users and Row Level Security.

## 2. Configure the site

Add these GitHub Actions repository secrets:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The Pages deployment injects the public URL/key into `config.js`. The service/secret key is used only by the crawler and must never be exposed to the browser.

## 3. Create your admin account

Create your Supabase Auth email/password user, then add its user UUID to `public.admin_users` with role `admin`.

Open:

`https://heysiddhartha.github.io/kolkata-startup-map/admin.html`

## 4. What becomes automatic

- Public startup submissions are written to the database.
- The map reads approved startups from the database.
- Live jobs are read from the database.
- GitHub Actions checks official career pages daily.
- JobPosting JSON-LD is parsed automatically.
- Career URLs are discovered from common paths when missing.
- Jobs not seen for 7 days become stale rather than disappearing.
- The public deployment receives the backend configuration automatically.

## Important

The crawler intentionally does not claim a job is live when a company site cannot be checked. It prefers official company career pages and public ATS/job pages over scraped aggregators.

The admin dashboard remains available for correcting false positives, approving unusual submissions, and maintaining data quality.
