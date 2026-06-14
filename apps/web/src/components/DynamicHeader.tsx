'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';

export function DynamicHeader() {
  const pathname = usePathname();

  // Determine current page based on pathname
  let currentPage:
    | 'home'
    | 'checker'
    | 'fingerprint'
    | 'docs'
    | 'playground'
    | 'ip'
    | undefined;

  if (pathname === '/') {
    currentPage = 'home';
  } else if (pathname.startsWith('/checker')) {
    currentPage = 'checker';
  } else if (pathname.startsWith('/fingerprint')) {
    currentPage = 'fingerprint';
  } else if (pathname.startsWith('/docs')) {
    currentPage = 'docs';
  } else if (pathname.startsWith('/playground')) {
    currentPage = 'playground';
  } else if (pathname.startsWith('/ip')) {
    currentPage = 'ip';
  }

  return <Header currentPage={currentPage} />;
}
