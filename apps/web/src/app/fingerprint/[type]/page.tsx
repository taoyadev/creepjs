import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Terminal } from 'lucide-react';

import { CopyButton } from '@/components/CopyButton';
import { SeoInternalLinks } from '@/components/SeoInternalLinks';
import { StructuredData } from '@/components/StructuredData';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { readVettedSignalMarkdown } from '@/lib/fingerprint-markdown';
import {
  SITE_CONFIG,
  generateMetadata as buildMetadata,
  structuredData,
} from '@/lib/metadata';
import {
  FINGERPRINT_TECHNIQUES,
} from '@/lib/seo-routes';

import FingerprintPlayground from './FingerprintPlayground';

export const dynamicParams = false;

function getTechnique(
  type: string
): (typeof FINGERPRINT_TECHNIQUES)[number] | undefined {
  return FINGERPRINT_TECHNIQUES.find(
    (technique) => technique.slug === type
  );
}

export function generateStaticParams() {
  return FINGERPRINT_TECHNIQUES.map(({ slug }) => ({ type: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const technique = getTechnique(type);

  if (!technique) {
    return { title: 'Invalid Fingerprint Type | CreepJS' };
  }

  const baseMetadata = buildMetadata({
    title: `${technique.name} - Browser Fingerprinting`,
    description: technique.description,
    path: `/fingerprint/${technique.slug}`,
  });

  return {
    ...baseMetadata,
    keywords: [
      ...(Array.isArray(baseMetadata.keywords) ? baseMetadata.keywords : []),
      technique.name.toLowerCase(),
      technique.slug,
      technique.category.toLowerCase(),
      'fingerprint detection',
      'browser tracking',
      'device fingerprint',
    ],
  };
}

export default async function FingerprintPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const technique = getTechnique(type);

  if (!technique) {
    notFound();
  }

  const markdown = readVettedSignalMarkdown(technique);
  const apiExample = `fetch('${SITE_CONFIG.apiUrl}/v1/fingerprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': 'YOUR_API_TOKEN'
  },
  body: JSON.stringify(fingerprint)
});`;

  return (
    <>
      <StructuredData
        data={[
          structuredData.techArticle({
            headline: `${technique.name} Browser Fingerprinting`,
            description: technique.description,
            path: `/fingerprint/${technique.slug}`,
            keywords: [
              technique.name,
              technique.category,
              'browser fingerprinting',
              'privacy testing',
            ],
          }),
          structuredData.breadcrumb([
            { name: 'Home', url: SITE_CONFIG.url },
            {
              name: 'Fingerprint Signals',
              url: `${SITE_CONFIG.url}/fingerprint`,
            },
            {
              name: technique.name,
              url: `${SITE_CONFIG.url}/fingerprint/${technique.slug}`,
            },
          ]),
        ]}
      />

      <main className="from-background to-secondary min-h-screen bg-gradient-to-b">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <header className="mb-8 max-w-3xl">
            <p className="text-muted-foreground mb-2 text-sm">
              {technique.category}
            </p>
            <h1 className="mb-3 text-4xl font-bold">{technique.name}</h1>
            <p className="text-muted-foreground text-lg">
              {technique.description}
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="min-w-0 space-y-6 lg:col-span-2">
              <FingerprintPlayground
                type={technique.slug}
                name={technique.name}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" aria-hidden="true" />
                    API integration
                  </CardTitle>
                  <CardDescription>
                    Send a complete collected fingerprint to the authenticated
                    API endpoint.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative min-w-0">
                    <pre
                      className="bg-muted max-w-full overflow-x-auto rounded p-4 pr-28 text-xs"
                      tabIndex={0}
                    >
                      <code>{apiExample}</code>
                    </pre>
                    <CopyButton
                      value={apiExample}
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-2"
                      ariaLabel="Copy API example"
                      successMessage="API example copied"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="min-w-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                    Continue testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/checker">Run the full checker</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/playground">Open the API playground</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/fingerprint">Browse all signals</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {FINGERPRINT_TECHNIQUES.filter(
                      ({ slug }) => slug !== technique.slug
                    )
                      .slice(0, 10)
                      .map((related) => (
                        <Button
                          key={related.slug}
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link href={`/fingerprint/${related.slug}`}>
                            {related.name}
                          </Link>
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          <article className="prose prose-slate dark:prose-invert mt-8 max-w-none rounded-lg border bg-background p-6 sm:p-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
      </main>

      <SeoInternalLinks
        currentPath={`/fingerprint/${technique.slug}`}
        title="Compare related fingerprint signals"
        description="Move from this collector to the CreepJS signal index, live checker, API docs, and other high-value fingerprinting explainers."
      />
    </>
  );
}
