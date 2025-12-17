import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'API Playground - Test Fingerprinting in Real-Time',
  description:
    'Interactive CreepJS API playground. Test browser fingerprinting endpoints, experiment with different collectors, and see live API responses with syntax-highlighted JSON.',
  path: '/playground',
});

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
