import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Documentation - API & Integration Guide',
  description:
    'Complete CreepJS documentation for developers. Learn how to integrate browser fingerprinting into your application with our RESTful API, JavaScript SDK, and comprehensive guides.',
  path: '/docs',
});

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
