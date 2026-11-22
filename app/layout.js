import { Suspense } from "react";
import collection from "../collection.config.js";
import "./globals.css";
import ThemeProvider from "../components/ThemeProvider";
import LanguageProvider from "../components/LanguageProvider";
import { THEME_ORDER } from "../data/themes.js";

// Runs before anything on the page is drawn, so a returning reader never sees
// the defaults first: without it the page painted dark, then faded into a
// saved light mode once React had loaded. Same keys and rules as
// ThemeProvider and LanguageProvider; it only paints, they take it from here.
const restorePreferences = `(function () {
  try {
    var root = document.documentElement;
    var themes = ${JSON.stringify(THEME_ORDER)};
    var mode = localStorage.getItem("archive_mode");
    root.setAttribute("data-mode", mode === "light" ? "light" : "dark");
    var fromUrl = new URLSearchParams(location.search).get("theme");
    var theme = themes.indexOf(fromUrl) > -1 ? fromUrl : localStorage.getItem("archive_theme");
    root.setAttribute("data-theme", themes.indexOf(theme) > -1 ? theme : "all");
    if (localStorage.getItem("archive_language") === "km") root.lang = "km";
  } catch (e) {}
})();`;

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-mode="dark" data-theme="all" suppressHydrationWarning>
      <body>
        {/* First thing in <body>: it runs before the rest of the page is
            parsed, so the saved theme and mode are in place for the first
            paint. Inline because it must not wait on a download. */}
        <script dangerouslySetInnerHTML={{ __html: restorePreferences }} />
        {/* These are declared in the tree rather than inside a literal <head>:
            React hoists them itself, and a hand-written <head> makes React
            reconcile that subtree on soft navigation, which can evict the
            stylesheet <link> Next injects for globals.css. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&family=Noto+Serif+Khmer:wght@400..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
          precedence="default"
        />
        {/* ThemeProvider reads the query string, which is only known at request
            time; Suspense lets the rest of the shell prerender regardless. */}
        <Suspense>
          <LanguageProvider><ThemeProvider>{children}</ThemeProvider></LanguageProvider>
        </Suspense>
      </body>
    </html>
  );
}

