import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StructuredData } from '@/components/StructuredData';
import { readVettedSignalMarkdown } from '@/lib/fingerprint-markdown';
import {
  SITE_CONFIG,
  generateMetadata as buildMetadata,
  structuredData,
} from '@/lib/metadata';
import { FINGERPRINT_TECHNIQUES } from '@/lib/seo-routes';

import FingerprintPlayground from './FingerprintPlayground';

export const dynamicParams = false;

function getTechnique(
  type: string
): (typeof FINGERPRINT_TECHNIQUES)[number] | undefined {
  return FINGERPRINT_TECHNIQUES.find((technique) => technique.slug === type);
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

      <div className="container mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-8 md:py-8">
        <header className="space-y-2">
          <nav
            aria-label="Breadcrumb"
            className="text-muted-foreground flex flex-wrap gap-2 text-sm"
          >
            <Link href="/fingerprint" className="underline underline-offset-4">
              All signals
            </Link>
            <span aria-hidden="true">/</span>
            <span>{technique.category}</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {technique.name}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6">
            {technique.description}
          </p>
        </header>
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <FingerprintPlayground
              key={technique.slug}
              type={technique.slug}
              name={technique.name}
            />
            <nav
              aria-label="Continue testing"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
            >
              <Link
                href="/checker"
                className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
              >
                Run the full checker
              </Link>
              <Link
                href="/playground"
                className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
              >
                Test the API
              </Link>
              <Link
                href="/docs"
                className="text-primary inline-flex min-h-11 items-center underline underline-offset-4"
              >
                Integration docs
              </Link>
            </nav>
          </div>
          <article className="prose prose-sm prose-slate dark:prose-invert prose-headings:scroll-mt-24 prose-h2:mb-2 prose-h2:mt-5 prose-h2:text-base prose-p:leading-6 prose-a:break-words first:prose-h2:mt-0 min-w-0 max-w-none rounded-xl border p-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
        <nav aria-label="Related signals" className="space-y-3 border-t py-5">
          <h2 className="text-lg font-semibold">
            Compare related {technique.category.toLowerCase()} signals
          </h2>
          <div className="flex flex-wrap gap-3">
            {FINGERPRINT_TECHNIQUES.filter(
              (item) =>
                item.slug !== technique.slug &&
                item.category === technique.category
            )
              .slice(0, 5)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/fingerprint/${item.slug}`}
                  className="text-primary inline-flex min-h-11 items-center rounded-md border px-3 text-sm"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </nav>
      </div>
    </>
  );
}
