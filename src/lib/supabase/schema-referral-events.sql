-- Optional table to log every referral event for analytics & audit.
-- Run in Supabase SQL editor if you want the full audit trail.
-- The app works without this table (creditReferral silently skips the insert).

create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid references public.ambassadors(id) on delete cascade,
  code text not null,
  kind text not null check (kind in ('waitlist', 'ambassador', 'signup', 'booking', 'marketplace')),
  created_at timestamptz default now()
);

create index if not exists referral_events_ambassador_idx on public.referral_events(ambassador_id);
create index if not exists referral_events_created_idx on public.referral_events(created_at desc);

alter table public.referral_events enable row level security;

-- Only service_role can read/write
create policy "service role full access" on public.referral_events
  for all using (auth.role() = 'service_role');
