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

  // The theme is part of what the reader is looking at, so the URL owns it:
  // it survives a reload, a shared link, and the browser's back button.
  const themeParam = searchParams.get("theme");
  const selectedTheme = THEME_ORDER.includes(themeParam) ? themeParam : "all";

  // Mode is a display preference rather than a view of the archive, so it
  // stays in state and out of the address bar.
  const [isDark, setIsDark] = useState(true);

  // The theme tables in globals.css key off these two attributes, so setting
  // them here retints every surface at once.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", selectedTheme);
    root.setAttribute("data-mode", isDark ? "dark" : "light");
  }, [selectedTheme, isDark]);

  const setSelectedTheme = useCallback(
    (theme) => {
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

  const value = {
    selectedTheme,
    setSelectedTheme,
    isDark,
    toggleMode: () => setIsDark((dark) => !dark),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
