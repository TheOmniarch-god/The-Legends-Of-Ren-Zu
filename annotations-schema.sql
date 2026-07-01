-- Highlights and notes table for The Legends of Ren Zu
-- Run in Supabase SQL Editor.

create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'highlight' check (type in ('highlight', 'note')),
  chapter_num text not null,
  chapter_title text not null,
  sentence_idx integer not null,
  text text,
  note text,
  color text not null default 'gold',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists annotations_unique_user_target_idx
on public.annotations(user_id, type, chapter_num, sentence_idx);

create index if not exists annotations_user_updated_idx
on public.annotations(user_id, updated_at desc);

alter table public.annotations enable row level security;

drop policy if exists "Users can read own annotations" on public.annotations;
create policy "Users can read own annotations"
on public.annotations
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own annotations" on public.annotations;
create policy "Users can insert own annotations"
on public.annotations
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own annotations" on public.annotations;
create policy "Users can update own annotations"
on public.annotations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own annotations" on public.annotations;
create policy "Users can delete own annotations"
on public.annotations
for delete
to authenticated
using (auth.uid() = user_id);

-- Server-side API uses service role and bypasses RLS for all operations.
