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

-- If an older patch inserted The Omniarch automatically, remove that automatic listing.
-- The account will appear after enabling Venerable Listing from the Hall UI.
delete from public.hall_venerables hv
using public.profiles p
where hv.id = p.id
  and lower(p.email) = lower('omniarchportal@gmail.com')
  and hv.created_at is not null;

-- Founder title/order are applied automatically by /api/hall when The Omniarch enables listing.
