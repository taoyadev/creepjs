import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Demo - Live Fingerprinting',
  description:
    'Try CreepJS live browser fingerprinting demo. See how your browser fingerprint is generated in real-time with detailed analysis of canvas, WebGL, navigator, and more.',
  path: '/demo',
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
