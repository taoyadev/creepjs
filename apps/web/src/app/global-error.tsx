'use client';

import { useEffect } from 'react';
import './globals.css';

// Catches errors thrown by the root layout itself (ThemeProvider, header,
// analytics). app/error.tsx renders inside that layout, so it cannot. This
// replaces the whole document, hence its own <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled root layout error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        <main className="container mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
            CreepJS could not start in this browser. Everything runs locally, so
            retrying usually fixes it.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
            >
              Try again
            </button>
            {/* Full navigation, not <Link>: the client router lives in the
                layout that just failed. */}
            <a
              href="/"
              className="text-primary text-sm font-medium hover:underline"
            >
              Back to the homepage
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
