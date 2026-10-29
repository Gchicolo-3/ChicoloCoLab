-- CoLab Intake v1
-- Lives inside the focusedoutreach project for now. All objects are prefixed intake_
-- so they can be dropped or merged later without touching anything else:
--   drop table public.intake_responses, public.intake_clients;
-- RLS is on for both tables, and there are NO policies for anon or authenticated.
-- All reads and writes go through server routes using the service role key.

create table public.intake_clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  config_key text not null,
  token text not null unique check (char_length(token) >= 10),
  created_at timestamptz not null default now()
);

create table public.intake_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.intake_clients (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  current_step int not null default 0,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  notified_at timestamptz
);

-- One response per client for v1.
create unique index intake_responses_client_id_key on public.intake_responses (client_id);

alter table public.intake_clients enable row level security;
alter table public.intake_responses enable row level security;

-- Belt and suspenders: no table privileges for the public API roles either.
revoke all on public.intake_clients from anon, authenticated;
revoke all on public.intake_responses from anon, authenticated;

-- Seed Gerardo with a random 32 character token.
insert into public.intake_clients (slug, name, config_key, token)
values ('gerardo', 'Gerardo', 'gerardo', replace(gen_random_uuid()::text, '-', ''));
