'use client';

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { THEME_ORDER } from "../data/themes.js";

// Theme and mode are shared by every page, so they live above the routes
// rather than inside one of them.
const ThemeContext = createContext(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return value;
}

export default function ThemeProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A theme named in the address (a shared link) always wins. Without one,
  // the reader's saved theme applies.
  const themeParam = searchParams.get("theme");
  const urlTheme = THEME_ORDER.includes(themeParam) ? themeParam : null;
  const [savedTheme, setSavedTheme] = useState(null);
  const selectedTheme = urlTheme ?? savedTheme ?? "all";

  // Mode is a display preference rather than a view of the archive, so it
  // stays out of the address bar and is remembered in localStorage instead.
  const [isDark, setIsDark] = useState(true);

  // The server cannot see localStorage, so it renders the defaults. The inline
  // script in app/layout.js has already painted the saved theme and mode on
  // <html> before the page appeared; this catches React's state up to it.
  // Until it has, the effect below must not write the defaults back, or the
  // page would flash dark and fade into light on every load.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("archive_mode") === "light") setIsDark(false);
      const stored = localStorage.getItem("archive_theme");
      if (THEME_ORDER.includes(stored)) setSavedTheme(stored);
    } catch {}
    setRestored(true);
  }, []);

  // The theme tables in globals.css key off these two attributes, so setting
  // them here retints every surface at once.
  useEffect(() => {
    if (!restored) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", selectedTheme);
    root.setAttribute("data-mode", isDark ? "dark" : "light");
  }, [restored, selectedTheme, isDark]);

  // Arriving through a themed link counts as choosing that theme.
  useEffect(() => {
    if (!urlTheme) return;
    try { localStorage.setItem("archive_theme", urlTheme); } catch {}
  }, [urlTheme]);

  const setSelectedTheme = useCallback(
    (theme) => {
      setSavedTheme(theme);
      try { localStorage.setItem("archive_theme", theme); } catch {}

      const params = new URLSearchParams(searchParams);
      // "all" is the default, so it is left out to keep clean URLs shareable.
      if (theme === "all") params.delete("theme");
      else params.set("theme", theme);

      // Changing the category invalidates whichever entry was open.
      params.delete("entry");

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleMode = () => {
    setIsDark((dark) => {
      try { localStorage.setItem("archive_mode", dark ? "light" : "dark"); } catch {}
      return !dark;
    });
  };

  const value = {
    selectedTheme,
    setSelectedTheme,
    isDark,
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
