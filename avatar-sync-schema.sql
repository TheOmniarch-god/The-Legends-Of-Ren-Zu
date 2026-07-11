-- Run this in your Supabase SQL Editor to enable Avatar Syncing across devices!
-- It adds an "avatar_choice" column to both profiles and users tables.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_choice text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_choice text;
