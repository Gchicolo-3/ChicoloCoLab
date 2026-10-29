-- CoLab Intake v1
-- Two tables. RLS is on for both, and there are NO policies for anon or authenticated.
-- All reads and writes go through server routes using the service role key.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  config_key text not null,
  token text not null unique check (char_length(token) >= 10),
  created_at timestamptz not null default now()
);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  current_step int not null default 0,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  notified_at timestamptz
);

-- One response per client for v1.
create unique index responses_client_id_key on public.responses (client_id);

alter table public.clients enable row level security;
alter table public.responses enable row level security;

-- Belt and suspenders: no table privileges for the public API roles either.
revoke all on public.clients from anon, authenticated;
revoke all on public.responses from anon, authenticated;

-- Seed Gerardo with a random 32 character token.
insert into public.clients (slug, name, config_key, token)
values ('gerardo', 'Gerardo', 'gerardo', replace(gen_random_uuid()::text, '-', ''));
