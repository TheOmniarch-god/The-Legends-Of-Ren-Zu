-- Run in Supabase SQL Editor to sync avatar choice across devices/accounts.
alter table public.profiles add column if not exists avatar_choice text;
alter table public.users add column if not exists avatar_choice text;
