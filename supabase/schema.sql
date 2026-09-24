-- Run once in the Supabase SQL Editor for a new project.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 254),
  phone text not null check (phone ~ '^0[0-9]{9,10}$'),
  plan text not null check (plan in ('light', 'smart', 'plus')),
  call_option text not null default 'none' check (call_option in ('none', 'five', 'unlimited')),
  support boolean not null default false,
  campaign boolean not null default false,
  consent boolean not null check (consent = true),
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'completed')),
  created_at timestamptz not null default now(),
  constraint campaign_plan check (not campaign or plan = 'smart')
);
create index applications_created_at_idx on public.applications (created_at desc, id);
alter table public.applications enable row level security;
-- Browser-facing roles cannot read or write personal information.
revoke all on public.applications from anon, authenticated;
grant select, insert, update on public.applications to service_role;
comment on table public.applications is 'LinkOne Mobile fictional portfolio applications';
