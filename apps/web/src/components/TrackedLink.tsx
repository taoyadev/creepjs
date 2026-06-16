'use client';

import Link, { type LinkProps } from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { analytics } from '@/lib/analytics';

type TrackedLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode;
    eventLabel: string;
    eventSection?: string;
    eventKind?: 'button' | 'link';
  };

function hrefToString(href: LinkProps['href']) {
  if (typeof href === 'string') return href;
  return href.pathname ?? '';
}

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
    const linkUrl = hrefToString(href);

    analytics.track.linkClicked({
      linkUrl,
      label: eventLabel,
    });

    if (eventKind === 'button') {
      analytics.track.buttonClicked({
        buttonLabel: eventLabel,
        section: eventSection,
      });
    }

    onClick?.(event);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
