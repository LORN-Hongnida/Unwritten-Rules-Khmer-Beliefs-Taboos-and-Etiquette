'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import collection from '../collection.config.js';

// One query for every submitter on the page, not one per card. If the lookup
// fails (or the profiles table is not there yet) the archive still loads; the
// cards just go without a "Submitted by" line.
export async function fetchDisplayNames(supabase, entries) {
  const ids = [...new Set(entries.map((e) => e.owner).filter(Boolean))];
  if (ids.length === 0) return {};

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', ids);

  if (error) {
    console.error('Failed to fetch submitter names:', error);
    return {};
  }
  return Object.fromEntries(data.map((p) => [p.id, p.display_name]));
}

export function normalizeEntry(item) {
  return {
    id: item.id,
    title: item.title,
    titleKm: item.title_km || item.titleKm,
    category: item.category,
    description: item.description,
    reason: item.reason,
    stillBelieved: item.still_believed || item.stillBelieved,
    place: item.place,
    contributor: item.contributor || item.contributor_name || null,
    photo_url: item.photo_url,
    // The database column is NOT NULL with a default, so item.status is always
    // set. The fallback exists only as a last resort against undefined data.
    status: item.status || 'pending',
    owner: item.owner,
    created_at: item.created_at,
  };
}

export default function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setLoading(false);
      return;
    }

    async function fetchEntries() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // The Supabase query already filters by status = 'published', but with
          // RLS a reviewer's session can return every status. The client-side
          // filter is defense-in-depth: only published entries reach the public.
          const published = data.map(normalizeEntry).filter((e) => e.status === 'published');
          const names = await fetchDisplayNames(supabase, published);
          // No owner means a seed entry the curator added straight to the
          // database, so the curator is its submitter.
          setEntries(published.map((e) => ({
            ...e,
            submittedBy: e.owner ? names[e.owner] || null : collection.curator,
          })));
        } else if (error) {
          console.error('Failed to fetch entries from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to fetch entries from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, []);

  return { entries, loading };
}
