import React from 'react';
import { fingerprintGlyph } from '@/components/home/fingerprint-summary';
import { cn } from '@/lib/utils';

interface FingerprintGlyphProps {
  id: string | null;
  scanning: boolean;
  className?: string;
}

/**
 * Decorative mark for the current ID. Each ring's resting angle is an SVG
 * attribute, so the CSS spin used while collectors run composes with it
 * instead of replacing it. Reduced-motion users get the static mark.
 */
export function FingerprintGlyph({
  id,
  scanning,
  className,
}: FingerprintGlyphProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="40"
        cy="40"
        r="39"
        className="fill-background stroke-primary/25"
        strokeWidth="1"
      />
      {fingerprintGlyph(id).map((ring, index) => (
        <g key={ring.radius} transform={`rotate(${ring.rotation} 40 40)`}>
          <circle
            cx="40"
            cy="40"
            r={ring.radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={ring.dash}
            className={cn(
              'origin-center transition-[stroke-dasharray] duration-700 ease-out [transform-box:fill-box]',
              scanning &&
                (index % 2
                  ? 'motion-safe:animate-[spin_4.5s_linear_infinite_reverse]'
                  : 'motion-safe:animate-[spin_6s_linear_infinite]')
            )}
          />
        </g>
      ))}
    </svg>
  );
}
