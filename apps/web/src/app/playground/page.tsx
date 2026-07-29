import Link from 'next/link';
import { Code, KeyRound, Terminal } from 'lucide-react';

import { PlaygroundApp } from '@/components/playground/PlaygroundApp';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PlaygroundPage() {
  return (
    <main className="from-background to-secondary min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
        <header className="max-w-3xl space-y-3">
          <p className="text-primary text-sm font-semibold">Developer tools</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            API Playground
          </h1>
          <p className="text-muted-foreground text-base leading-7 md:text-lg">
            Generate an in-memory API token, inspect your browser fingerprint,
            and run the authenticated fingerprint endpoint without setting up a
            local backend.
          </p>
        </header>

        <PlaygroundApp />

        <section
          aria-labelledby="playground-endpoints"
          className="border-t pt-8"
        >
          <div className="mb-5 max-w-3xl space-y-2">
            <h2
              id="playground-endpoints"
              className="text-2xl font-semibold tracking-tight"
            >
              Endpoint reference
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              This workspace exercises the same production API base used by the
              docs. Tokens remain in this component session and are not written
              to the URL or browser storage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                  POST /v1/token
                </CardTitle>
                <CardDescription>
                  Request an API token for the supplied email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                The returned token is displayed only in the interactive
                workspace so you can copy it or use it in the next request.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Terminal className="h-5 w-5" aria-hidden="true" />
                  POST /v1/fingerprint
                </CardTitle>
                <CardDescription>
                  Submit the fingerprint collected by this browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                The request uses the token in the controlled field and shows the
                formatted response in place without replacing the page.
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          aria-labelledby="playground-next"
          className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="max-w-2xl">
            <h2 id="playground-next" className="text-xl font-semibold">
              Continue with the integration
            </h2>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              Review the API contract or compare the complete collector output
              before wiring a server-side token boundary.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/docs">
                <Code className="mr-2 h-4 w-4" aria-hidden="true" />
                Read API docs
              </Link>
            </Button>
            <Button asChild>
              <Link href="/checker">Run the checker</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
