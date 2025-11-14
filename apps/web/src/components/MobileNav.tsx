'use client';

import React, { useState } from 'react';
import { Menu, X, Home, FileText, Code, Fingerprint } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileNavProps {
  currentPage?: 'home' | 'checker' | 'docs' | 'playground';
}

export function MobileNav({ currentPage }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Home, page: 'home' },
    { href: '/checker', label: 'Checker', icon: Fingerprint, page: 'checker' },
    { href: '/docs', label: 'Docs', icon: FileText, page: 'docs' },
    { href: '/playground', label: 'Playground', icon: Code, page: 'playground' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-l bg-background shadow-xl md:hidden">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;

                return (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}

              {/* Theme Toggle in Mobile Menu */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
