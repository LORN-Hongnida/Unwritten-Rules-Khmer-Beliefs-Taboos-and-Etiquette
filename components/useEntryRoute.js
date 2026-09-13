'use client';

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import entries from "../data/entries.js";

// Which entry is open is part of the address, not just component state: that
// is what makes the modal's share button able to hand someone a real link.
//
// Opening pushes a history entry so Back closes the modal; closing replaces it
// so the reader does not have to press Back twice to leave the page.
export default function useEntryRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const entryId = searchParams.get("entry");
  const openEntry = entryId
    ? entries.find((entry) => entry.id === entryId) ?? null
    : null;

  const buildHref = useCallback(
    (id) => {
      const params = new URLSearchParams(searchParams);
      if (id) params.set("entry", id);
      else params.delete("entry");

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const setOpenEntry = useCallback(
    (entry) => {
      const href = buildHref(entry?.id);
      if (entry) router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    },
    [buildHref, router]
  );

  return { openEntry, setOpenEntry, buildHref };
}
