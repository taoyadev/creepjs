'use client';

import React, { useState } from 'react';
import {
  Menu,
  Home,
  FileText,
  Code,
  Fingerprint,
  Shield,
  Waypoints,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { HAS_PROXY_PROVIDERS } from '@/lib/proxy-providers';
import { trackEvent } from '@/lib/analytics';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileNavProps {
  currentPage?:
    | 'home'
    | 'checker'
    | 'fingerprint'
    | 'docs'
    | 'playground'
    | 'proxy-providers'
    | 'ip';
}

export const navItems = [
  { href: '/', label: 'Home', icon: Home, page: 'home' },
  { href: '/checker', label: 'Checker', icon: Fingerprint, page: 'checker' },
  { href: '/ip', label: 'IP Risk', icon: Shield, page: 'ip' },
  {
    href: '/fingerprint',
    label: 'Signals',
    icon: Waypoints,
    page: 'fingerprint',
  },
  { href: '/docs', label: 'Docs', icon: FileText, page: 'docs' },
  {
    href: '/playground',
    label: 'Playground',
    icon: Code,
    page: 'playground',
  },
  ...(HAS_PROXY_PROVIDERS
    ? [
        {
          href: '/proxy-providers',
          label: 'Proxy providers',
          icon: Waypoints,
          page: 'proxy-providers',
        } as const,
      ]
    : []),
] as const;

/**
 * Mobile navigation built on the Sheet (Radix Dialog) primitive so focus
 * trapping, Escape handling, aria-expanded, and focus return come from the
 * a11y primitive instead of a hand-rolled overlay.
 */
export function MobileNav({ currentPage }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    const desktop = window.matchMedia(
      HAS_PROXY_PROVIDERS ? '(min-width: 1280px)' : '(min-width: 768px)'
    );
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    desktop.addEventListener('change', closeAtDesktop);
    return () => desktop.removeEventListener('change', closeAtDesktop);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={HAS_PROXY_PROVIDERS ? 'xl:hidden' : 'md:hidden'}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Navigate between the CreepJS privacy tools and documentation.
        </SheetDescription>
        <nav className="mt-6 flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;

            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    setOpen(false);
                    if (item.page === 'proxy-providers')
                      trackEvent('link_clicked', {
                        label: 'proxy-providers',
                        section: 'navigation',
                      });
                  }}
                >
                  <Icon aria-hidden="true" className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
