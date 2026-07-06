-- Reading progress table for The Legends of Ren Zu
-- Run in Supabase SQL Editor.

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_num text not null,
  chapter_title text not null,
  scroll_percent integer not null default 0 check (scroll_percent >= 0 and scroll_percent <= 100),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, chapter_num)
);

create index if not exists reading_progress_user_updated_idx
on public.reading_progress(user_id, updated_at desc);

alter table public.reading_progress enable row level security;

drop policy if exists "Users can read own reading progress" on public.reading_progress;
create policy "Users can read own reading progress"
on public.reading_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own reading progress" on public.reading_progress;
create policy "Users can insert own reading progress"
on public.reading_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own reading progress" on public.reading_progress;
create policy "Users can update own reading progress"
on public.reading_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Server-side API uses service role and bypasses RLS for upserts.
