-- Run this in Supabase SQL Editor to create/fix the Hall Of Venerables table.
create table if not exists public.hall_venerables (
  id uuid primary key references public.profiles(id) on delete cascade,
  username text not null,
  title text not null default 'Venerable',
  avatar_choice text,
  codex_count integer not null default 0,
  total_gu integer not null default 0,
  is_myriad boolean not null default false,
  display_order integer not null default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.hall_venerables
  add column if not exists title text not null default 'Venerable',
  add column if not exists avatar_choice text,
  add column if not exists is_myriad boolean not null default false,
  add column if not exists display_order integer not null default 100,
  add column if not exists updated_at timestamptz default now();

create index if not exists hall_venerables_order_idx
  on public.hall_venerables (display_order asc, is_myriad desc, codex_count desc, created_at asc);

alter table public.hall_venerables enable row level security;

drop policy if exists "Hall venerables are publicly readable" on public.hall_venerables;
create policy "Hall venerables are publicly readable"
  on public.hall_venerables for select
  using (true);

-- Seed The Omniarch as first Hall entry if the profile exists.
insert into public.hall_venerables (
  id, username, title, avatar_choice, codex_count, total_gu, is_myriad, display_order, created_at, updated_at
)
select
  p.id,
  'The Omniarch',
  'Founder · Supreme Venerable',
  coalesce(p.avatar_choice, 'avatar_08'),
  0,
  0,
  false,
  0,
  now(),
  now()
from public.profiles p
where lower(p.email) = lower('omniarchportal@gmail.com')
on conflict (id) do update set
  username = 'The Omniarch',
  title = 'Founder · Supreme Venerable',
  avatar_choice = coalesce(public.hall_venerables.avatar_choice, excluded.avatar_choice),
  display_order = 0,
  updated_at = now();
