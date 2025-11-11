'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileNav } from '@/components/MobileNav';

interface HeaderProps {
  currentPage?: 'home' | 'demo' | 'docs' | 'playground';
}

export function Header({ currentPage }: HeaderProps) {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl md:text-2xl font-bold">
          CreepJS.org
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button variant={currentPage === 'home' ? 'default' : 'ghost'} size="sm">
              Home
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant={currentPage === 'demo' ? 'default' : 'ghost'} size="sm">
              Demo
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant={currentPage === 'docs' ? 'default' : 'ghost'} size="sm">
              Docs
            </Button>
          </Link>
          <Link href="/playground">
            <Button variant={currentPage === 'playground' ? 'default' : 'ghost'} size="sm">
              Playground
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <MobileNav currentPage={currentPage} />
        </div>
      </div>
    </nav>
  );
}
