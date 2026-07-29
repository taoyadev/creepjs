'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
        An unexpected error occurred while rendering this page. Everything runs
        in your browser, so retrying usually fixes it.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline"
        >
          Back to the homepage
        </Link>
      </div>
    </div>
  );
}
