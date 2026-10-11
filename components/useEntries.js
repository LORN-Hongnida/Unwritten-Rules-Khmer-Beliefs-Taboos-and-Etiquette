'use client';

import { useEffect, useState } from 'react';
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
    contributor: item.contributor || item.contributor_name || null,
    photo_url: item.photo_url,
    status: item.status || 'published',
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
          setEntries(data.map(normalizeEntry));
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
