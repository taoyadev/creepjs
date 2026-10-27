'use client';

import Link, { type LinkProps } from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

type TrackedLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode;
    eventLabel: string;
    eventSection?: string;
    eventKind?: 'button' | 'link';
  };

export function TrackedLink({
  href,
  onClick,
  eventLabel,
  eventSection,
  eventKind = 'link',
  children,
  ...props
}: TrackedLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackEvent(eventKind === 'button' ? 'button_clicked' : 'link_clicked', {
      label: eventLabel,
      section: eventSection,
    });

    onClick?.(event);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
