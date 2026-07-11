-- Run this in your Supabase SQL Editor to split Highlights and Notes into separate tables.

-- 1. Create Dedicated Highlights Table
CREATE TABLE IF NOT EXISTS public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_num text NOT NULL,
  chapter_title text NOT NULL,
  sentence_idx integer NOT NULL,
  text text,
  color text NOT NULL DEFAULT 'gold',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS highlights_unique_user_target_idx
ON public.highlights(user_id, chapter_num, sentence_idx);

CREATE INDEX IF NOT EXISTS highlights_user_updated_idx
ON public.highlights(user_id, updated_at DESC);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Highlights Policies
DROP POLICY IF EXISTS "Users can read own highlights" ON public.highlights;
CREATE POLICY "Users can read own highlights"
ON public.highlights FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own highlights" ON public.highlights;
CREATE POLICY "Users can insert own highlights"
ON public.highlights FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own highlights" ON public.highlights;
CREATE POLICY "Users can delete own highlights"
ON public.highlights FOR DELETE TO authenticated
USING (auth.uid() = user_id);


-- 2. Create Dedicated Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_num text NOT NULL,
  chapter_title text NOT NULL,
  sentence_idx integer NOT NULL,
  text text,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notes_unique_user_target_idx
ON public.notes(user_id, chapter_num, sentence_idx);

CREATE INDEX IF NOT EXISTS notes_user_updated_idx
ON public.notes(user_id, updated_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Notes Policies
DROP POLICY IF EXISTS "Users can read own notes" ON public.notes;
CREATE POLICY "Users can read own notes"
ON public.notes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes"
ON public.notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
ON public.notes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
ON public.notes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
