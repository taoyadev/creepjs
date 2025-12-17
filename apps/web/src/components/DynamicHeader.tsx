'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';

export function DynamicHeader() {
  const pathname = usePathname();

  // Determine current page based on pathname
  let currentPage: 'home' | 'checker' | 'docs' | 'playground' | undefined;

  if (pathname === '/') {
    currentPage = 'home';
  } else if (pathname.startsWith('/checker')) {
    currentPage = 'checker';
  } else if (pathname.startsWith('/docs')) {
    currentPage = 'docs';
  } else if (pathname.startsWith('/playground')) {
    currentPage = 'playground';
  }

  return <Header currentPage={currentPage} />;
}
