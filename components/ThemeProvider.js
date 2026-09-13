'use client';

import { createContext, useContext, useEffect, useState } from "react";

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
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [isDark, setIsDark] = useState(true);

  // The theme tables in globals.css key off these two attributes, so setting
  // them here retints every surface at once.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", selectedTheme);
    root.setAttribute("data-mode", isDark ? "dark" : "light");
  }, [selectedTheme, isDark]);

  const value = {
    selectedTheme,
    setSelectedTheme,
    isDark,
    toggleMode: () => setIsDark((dark) => !dark),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
