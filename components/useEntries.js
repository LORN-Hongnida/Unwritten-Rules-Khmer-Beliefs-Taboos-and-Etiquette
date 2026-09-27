'use client';

import { useEffect, useState } from 'react';
import initialEntries from '../data/entries.js';
import { createClient } from '../lib/supabase/client';

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
    photo_url: item.photo_url,
    status: item.status || 'published',
    owner: item.owner,
    created_at: item.created_at,
  };
}

export default function useEntries() {
  const [entries, setEntries] = useState(() => initialEntries.map(normalizeEntry));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
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
          setEntries(data.map(normalizeEntry));
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
