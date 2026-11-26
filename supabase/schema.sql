-- Lyra Roadmap: cloud sync schema.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run again: every statement is idempotent.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  -- The whole progress document (the same JSON the app exports).
  data       jsonb not null,
  -- Incremented on every save; used to detect that another device saved first.
  revision   bigint not null default 1,
  updated_at timestamptz not null default now(),
  -- Keeps a single row from growing without limit (2 MB).
  constraint progress_data_size check (pg_column_size(data) < 2000000)
);

alter table public.progress enable row level security;

-- Each signed-in user can only touch their own row.
drop policy if exists "progress: select own" on public.progress;
create policy "progress: select own" on public.progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress: insert own" on public.progress;
create policy "progress: insert own" on public.progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress: update own" on public.progress;
create policy "progress: update own" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress: delete own" on public.progress;
create policy "progress: delete own" on public.progress
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Keep updated_at honest, whatever the client sends.
create or replace function public.progress_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch
  before insert or update on public.progress
  for each row execute function public.progress_touch();
