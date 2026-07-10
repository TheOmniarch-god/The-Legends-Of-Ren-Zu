-- Run this in your Supabase SQL Editor to create the Hall of Venerables table
CREATE TABLE IF NOT EXISTS hall_venerables (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_choice text,
  codex_count integer NOT NULL DEFAULT 0,
  total_gu integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);
