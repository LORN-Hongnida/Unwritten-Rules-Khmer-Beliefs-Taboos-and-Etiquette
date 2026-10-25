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
  -- Defaults to 'pending': an entry joins the public archive only once a
  -- reviewer moves it. See section 4, the review gate.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'returned'))
);

-- Migration support for existing table instance
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS contributor TEXT;

-- Index for searching and filtering by category & status
CREATE INDEX IF NOT EXISTS entries_category_idx ON public.entries (category);
CREATE INDEX IF NOT EXISTS entries_status_idx ON public.entries (status);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2.0 The review gate (Lab 10)
--
-- Run this subsection on its own against an existing database and it does the
-- whole migration; it is what was pasted into the Supabase SQL Editor. It is
-- wrapped in a transaction so a failure anywhere leaves the archive exactly as
-- it was, and every statement is written to be safe to run twice.
--
-- This database was already ahead of the lab script: a `status` column existed
-- with default 'published' and values ('draft','pending','published','rejected').
-- So the column is migrated rather than added, and the unused 'draft' and
-- 'rejected' are retired in favour of 'returned'.
-- ============================================================

BEGIN;

-- The old constraint has to go before the rows are moved, or a value the new
-- constraint allows could be refused by the old one mid-migration.
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_status_check;

-- Everything already in the archive came from the curator and their named
-- sources, so it is published. This also clears out any 'draft' or 'rejected'
-- row before the narrower constraint arrives.
UPDATE public.entries SET status = 'published' WHERE status <> 'published';

ALTER TABLE public.entries ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.entries
  ADD CONSTRAINT entries_status_check CHECK (status IN ('pending', 'published', 'returned'));

-- A reviewer's note on a returned entry, so "sent back to you" can say why.
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS review_note TEXT;
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_review_note_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_review_note_check
  CHECK (review_note IS NULL OR char_length(trim(review_note)) <= 500);

-- Who can review: a list only the SQL Editor can change. RLS is on with no
-- policies at all, which means the API can neither read this table nor write to
-- it. The only way onto the list is the dashboard.
CREATE TABLE IF NOT EXISTS public.reviewers (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id)
);
ALTER TABLE public.reviewers ENABLE ROW LEVEL SECURITY;

-- The curator's own UUID is inserted by hand in the SQL Editor. It is a real
-- user identifier and does not belong in a public repository:
--   insert into public.reviewers (user_id) values ('PASTE-YOUR-UUID-HERE')
--     on conflict do nothing;

-- A yes/no question any request can ask: am I a reviewer? SECURITY DEFINER so it
-- can read the reviewers table on the caller's behalf without granting the
-- caller any access to it.
CREATE OR REPLACE FUNCTION public.is_reviewer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.reviewers WHERE user_id = (SELECT auth.uid()));
$$;

-- The one door reviewers use. Because it is SECURITY DEFINER it checks
-- everything itself: not a reviewer, or a decision nobody planned for, or an
-- entry that is not waiting, and it refuses. It moves status and the note and
-- nothing else, so a reviewer never gains permission to edit someone's words.
-- `note` defaults to NULL, so two-argument calls still work.
CREATE OR REPLACE FUNCTION public.review_entry(entry_id UUID, decision TEXT, note TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
begin
  if not public.is_reviewer() then
    return false;
  end if;
  if decision not in ('published', 'returned') then
    return false;
  end if;
  update public.entries
    -- A published entry must not carry a stale note from an earlier return.
    set status = decision,
        review_note = case when decision = 'returned' then note else null end
    where id = entry_id and status = 'pending';
  return found;
end;
$$;

-- A CREATE OR REPLACE with a new signature is a new function and inherits none
-- of the old grants, so these are restated every run.
REVOKE EXECUTE ON FUNCTION public.review_entry(UUID, TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_entry(UUID, TEXT, TEXT) TO authenticated;

-- Policy 1: reading. Everyone sees published, owners see their own at any
-- status, reviewers see everything.
--
-- This replaces two separate SELECT policies ("Public read published entries"
-- and "Owners can view own entries"). Multiple SELECT policies OR together, so
-- leaving the old pair in place alongside this one would have been a hole, not
-- a redundancy.
DROP POLICY IF EXISTS "Public read published entries" ON public.entries;
DROP POLICY IF EXISTS "Owners can view own entries" ON public.entries;
DROP POLICY IF EXISTS "anyone can read published entries" ON public.entries;
CREATE POLICY "anyone can read published entries"
  ON public.entries
  FOR SELECT
  USING (
    status = 'published'
    OR (SELECT auth.uid()) = owner
    OR (SELECT public.is_reviewer())
  );

-- Policy 2: adding. Your own entry, and it waits. An insert that names itself
-- published is refused outright, which is why the form sends no status at all
-- and lets the column default decide.
DROP POLICY IF EXISTS "Contributors can insert entries" ON public.entries;
DROP POLICY IF EXISTS "owners add their own entries" ON public.entries;
CREATE POLICY "owners add their own entries"
  ON public.entries
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner AND status = 'pending');

-- Policy 3: editing. Your own entry, and an edit sends it back to review. A gate
-- that opens once and stays open is not a gate. Reviewers keep theirs published.
DROP POLICY IF EXISTS "Owners can update own entries" ON public.entries;
DROP POLICY IF EXISTS "owners edit their own entries" ON public.entries;
CREATE POLICY "owners edit their own entries"
  ON public.entries
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = owner)
  WITH CHECK (
    (SELECT auth.uid()) = owner
    AND (status = 'pending' OR (SELECT public.is_reviewer()))
  );

COMMIT;

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
ALTER TABLE public.entries ADD CONSTRAINT entries_description_check CHECK (char_length(trim(description)) >= 10 AND char_length(trim(description)) <= 1000);

-- The optional columns had no bounds at all, so the form's limits were the only
-- thing holding. Anyone posting straight to the API could store unbounded text;
-- these mirror the form so the database is what actually refuses junk.
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_reason_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_reason_check CHECK (reason IS NULL OR char_length(trim(reason)) <= 1000);

ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_still_believed_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_still_believed_check CHECK (still_believed IS NULL OR char_length(trim(still_believed)) <= 200);

ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_place_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_place_check CHECK (place IS NULL OR char_length(trim(place)) <= 100);

ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_contributor_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_contributor_check CHECK (contributor IS NULL OR char_length(trim(contributor)) <= 100);

-- Photos must come from storage, not an arbitrary host: a free-text column
-- lets an entry hotlink anywhere and point readers off-site.
ALTER TABLE public.entries DROP CONSTRAINT IF EXISTS entries_photo_url_check;
ALTER TABLE public.entries ADD CONSTRAINT entries_photo_url_check CHECK (photo_url IS NULL OR photo_url ~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/photos/');

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

