-- Bookmarks table for The Legends of Ren Zu
-- Run in Supabase SQL Editor.

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'chapter' check (type in ('chapter', 'sentence')),
  chapter_num text not null,
  chapter_title text not null,
  sentence_idx integer not null default -1,
  text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bookmarks_unique_user_target_idx
on public.bookmarks(user_id, type, chapter_num, sentence_idx);

create index if not exists bookmarks_user_created_idx
on public.bookmarks(user_id, created_at desc);

alter table public.bookmarks enable row level security;

drop policy if exists "Users can read own bookmarks" on public.bookmarks;
create policy "Users can read own bookmarks"
on public.bookmarks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own bookmarks" on public.bookmarks;
create policy "Users can insert own bookmarks"
on public.bookmarks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own bookmarks" on public.bookmarks;
create policy "Users can delete own bookmarks"
on public.bookmarks
for delete
to authenticated
using (auth.uid() = user_id);

-- Server-side API uses service role and bypasses RLS for all operations.
