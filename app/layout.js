import { Suspense } from "react";
import collection from "../collection.config.js";
import "./globals.css";
import ThemeProvider from "../components/ThemeProvider";

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-mode="dark" data-theme="all">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..900;1,100..900&family=Noto+Serif+Khmer:wght@400..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* ThemeProvider reads the query string, which is only known at request
            time; Suspense lets the rest of the shell prerender regardless. */}
        <Suspense>
          <ThemeProvider>{children}</ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}

