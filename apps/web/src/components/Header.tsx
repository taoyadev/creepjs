'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DIRECTORY_LISTED } from '@/lib/proxy-providers';
import { trackEvent } from '@/lib/analytics';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileNav, navItems } from '@/components/MobileNav';

interface HeaderProps {
  currentPage?:
    | 'home'
    | 'checker'
    | 'fingerprint'
    | 'docs'
    | 'playground'
    | 'proxy-providers'
    | 'ip';
}

export function Header({ currentPage }: HeaderProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur"
    >
      <div className="container mx-auto flex h-16 min-w-0 items-center justify-between px-4">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap text-xl font-bold md:text-2xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-blue-500"
            aria-hidden="true"
          >
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path>
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path>
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"></path>
            <path d="M2 12a10 10 0 0 1 18-6"></path>
            <path d="M2 16h.01"></path>
            <path d="M21.8 16c.2-2 .131-5.354 0-6"></path>
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"></path>
            <path d="M8.65 22c.21-.66.45-1.32.57-2"></path>
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2"></path>
          </svg>
          CreepJS
        </Link>

        {/* Desktop Navigation. Each item is one link styled as a button: a
            button nested in a link was two tab stops and invalid markup. */}
        <div
          className={
            DIRECTORY_LISTED
              ? 'hidden items-center gap-2 xl:flex'
              : 'hidden items-center gap-2 md:flex'
          }
        >
          {navItems.map((item) => {
            const isActive = currentPage === item.page;

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    if (item.page === 'proxy-providers')
                      trackEvent('link_clicked', {
                        label: 'proxy-providers',
                        section: 'navigation',
                      });
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </Button>
            );
          })}
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div
          className={
            DIRECTORY_LISTED
              ? 'flex items-center gap-2 xl:hidden'
              : 'flex items-center gap-2 md:hidden'
          }
        >
          <ThemeToggle />
          <MobileNav currentPage={currentPage} />
        </div>
      </div>
    </nav>
  );
}
