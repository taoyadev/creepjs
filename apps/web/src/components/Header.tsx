'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileNav } from '@/components/MobileNav';

interface HeaderProps {
  currentPage?: 'home' | 'checker' | 'docs' | 'playground';
}

export function Header({ currentPage }: HeaderProps) {
  return (
    <nav className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
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

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              size="sm"
            >
              Home
            </Button>
          </Link>
          <Link href="/checker">
            <Button
              variant={currentPage === 'checker' ? 'default' : 'ghost'}
              size="sm"
            >
              Checker
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              variant={currentPage === 'docs' ? 'default' : 'ghost'}
              size="sm"
            >
              Docs
            </Button>
          </Link>
          <Link href="/playground">
            <Button
              variant={currentPage === 'playground' ? 'default' : 'ghost'}
              size="sm"
            >
              Playground
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <MobileNav currentPage={currentPage} />
        </div>
      </div>
    </nav>
  );
}
