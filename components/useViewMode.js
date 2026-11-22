'use client';

import { useEffect, useState } from 'react';

// 'cards' or 'list', remembered per page in this browser only. It is a
// convenience, not data: if storage is blocked (private window, cleared site
// data) the page simply starts in cards every time.
export default function useViewMode(storageKey) {
  const [mode, setMode] = useState('cards');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'cards' || saved === 'list') setMode(saved);
    } catch {}
  }, [storageKey]);

  const changeMode = (next) => {
    setMode(next);
    try { localStorage.setItem(storageKey, next); } catch {}
  };

  return [mode, changeMode];
}
