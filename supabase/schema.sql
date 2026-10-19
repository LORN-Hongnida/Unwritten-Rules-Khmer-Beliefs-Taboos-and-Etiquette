-- ============================================================
-- Supabase Database Schema: Unwritten Rules Archive
-- ============================================================

-- 1. Create the `entries` table
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_km TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beliefs', 'taboos', 'etiquette')),
  description TEXT NOT NULL,
  reason TEXT,
  still_believed TEXT,
  place TEXT,
  contributor TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'rejected'))
);

-- Migration support for existing table instance
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS contributor TEXT;

-- Index for searching and filtering by category & status
CREATE INDEX IF NOT EXISTS entries_category_idx ON public.entries (category);
CREATE INDEX IF NOT EXISTS entries_status_idx ON public.entries (status);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read published entries
DROP POLICY IF EXISTS "Public read published entries" ON public.entries;
CREATE POLICY "Public read published entries"
  ON public.entries
  FOR SELECT
  USING (status = 'published');

-- Policy 1b: Owners can view their own entries regardless of status
DROP POLICY IF EXISTS "Owners can view own entries" ON public.entries;
CREATE POLICY "Owners can view own entries"
  ON public.entries
  FOR SELECT
  USING (auth.uid() = owner);

-- Policy 2: Authenticated users can insert their own entries
DROP POLICY IF EXISTS "Contributors can insert entries" ON public.entries;
CREATE POLICY "Contributors can insert entries"
  ON public.entries
  FOR INSERT
  WITH CHECK (auth.uid() = owner);

-- Policy 3: Owners can update their own entries
DROP POLICY IF EXISTS "Owners can update own entries" ON public.entries;
CREATE POLICY "Owners can update own entries"
  ON public.entries
  FOR UPDATE
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

-- Policy 4: Owners can delete their own entries
DROP POLICY IF EXISTS "Owners can delete own entries" ON public.entries;
CREATE POLICY "Owners can delete own entries"
  ON public.entries
  FOR DELETE
  USING (auth.uid() = owner);

-- 2.1 Table Check Constraints (Part 3)
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_title_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_title_check CHECK (char_length(trim(title)) >= 3 AND char_length(trim(title)) <= 150);

ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_title_km_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_title_km_check CHECK (char_length(trim(title_km)) >= 2 AND char_length(trim(title_km)) <= 150);

ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_description_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_description_check CHECK (char_length(trim(description)) >= 10);

-- ============================================================
-- 2.2 Storage Bucket and Policies (Part 0)
-- ============================================================

-- a public bucket for entry photos: images only, 5 MB max
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- logged-in contributors can upload, but only into a folder named after their own id
DROP POLICY IF EXISTS "contributors upload into their own folder" ON storage.objects;
create policy "contributors upload into their own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- and delete only what's in their own folder
DROP POLICY IF EXISTS "contributors delete their own photos" ON storage.objects;
create policy "contributors delete their own photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- ============================================================
-- 3. Seed Initial Collection Data (from data/entries.js)
-- ============================================================

INSERT INTO public.entries (title, title_km, category, description, reason, still_believed, place, contributor, status)
VALUES
  (
    'Crows crying over a rooftop',
    'ក្អែកយំលើដំបូលផ្ទះ',
    'beliefs',
    'This means a misfortune is coming; precisely, death is said to follow this event. So Cambodian people are always cautious and hate it when this is happening.',
    NULL,
    'Some people still believe in this — and this includes me.',
    'Kampong Cham',
    'Heng Vicheka',
    'published'
  ),
  (
    'Eating the tail part of a fish makes you know how to swim',
    'ស៊ីកន្ទុយត្រីចេះហែលទឹក',
    'beliefs',
    'This is commonly told to children who can''t swim: if they eat the tail of a fish, they''ll be able to swim.',
    'It was used by adults to convince children to eat the tail part of a fish, since it is not the delicious part — the most delicious is said to be the head. In conclusion, it is a trick to have children eat what the adults don''t want to eat.',
    'Not really.',
    'Kampong Cham',
    'Heng Vicheka',
    'published'
  ),
  (
    'A kite falling on a house''s rooftop',
    'ខ្លែងធ្លាក់លើដំបូលផ្ទះ',
    'beliefs',
    'This is similar to crows crying over the rooftop — it signals that misfortune is coming to the household.',
    'Kite in Khmer is "Kleng" and crow is also called "Kleng", so people believe them to mean the same thing.',
    'Some people still believe in this.',
    'Kampong Cham',
    'Heng Vicheka',
    'published'
  ),
  (
    'Eating while lying down turns you into a crocodile',
    'ស៊ីបាយផ្ដេកទៅជាក្រពើ',
    'taboos',
    'This was used by adults to scare children who are eating while lying down, saying "you''ll become a crocodile".',
    'This, I believe, is mostly to help children eat in a proper posture, avoiding choking.',
    'Not really.',
    'Kampong Cham',
    'Heng Vicheka',
    'published'
  ),
  (
    'Do not play with other people''s heads',
    'កុំលេងក្បាលគេ',
    'etiquette',
    'Playing with or touching someone''s head was said to cause the person to become less smart.',
    'In my opinion it''s rather to stop the head from getting injured accidentally, and could be a clever trick to use on children.',
    'Some people still believe in this.',
    'Kampong Cham',
    'Heng Vicheka',
    'published'
  );

