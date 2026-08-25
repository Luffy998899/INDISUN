-- Indisun Life Sciences — Supabase / Postgres schema
-- Run once in the Supabase SQL editor. The server uses the SERVICE ROLE key, so RLS is enabled with no public policies:
-- nothing is readable or writable from the browser/anon key.

create table if not exists products (
  id text primary key, brand text not null, molecule text not null, category text not null,
  segment text default '', pack text default '', icon text default 'pill', short_line text default '', description text default '',
  indications jsonb default '[]'::jsonb, dosage text default '', mrp integer default 0, image text, sort_order integer default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists enquiries (
  id uuid primary key, created_at timestamptz not null default now(), status text not null default 'new', type text default 'general',
  name text not null, email text not null, phone text not null, territory text default '', product text default '', message text default '',
  note text, ip text
);
create index if not exists enquiries_created_idx on enquiries (created_at desc);
create table if not exists site_content (k text primary key, v jsonb not null, updated_at timestamptz default now());
create table if not exists admin_users (id serial primary key, username text unique not null, password_hash text not null, created_at timestamptz default now(), last_login timestamptz);
create table if not exists admin_sessions (token_hash text primary key, user_id integer not null references admin_users(id) on delete cascade, created_at timestamptz not null, expires_at timestamptz not null, ip text, ua text);
create index if not exists admin_sessions_exp_idx on admin_sessions (expires_at);
create table if not exists login_attempts (id bigserial primary key, ip text, username text, ok boolean, at timestamptz not null);
create index if not exists login_attempts_ip_idx on login_attempts (ip, at desc);

-- Lock everything down: RLS on, no policies => only the service role (server) can access.
alter table products enable row level security;
alter table enquiries enable row level security;
alter table site_content enable row level security;
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;
alter table login_attempts enable row level security;

-- Storage bucket for uploaded product/site images (public read, server-only write):
-- Dashboard → Storage → New bucket "uploads" → Public bucket ON.  (Writes go through the server with the service key.)
