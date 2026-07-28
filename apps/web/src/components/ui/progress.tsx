import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ProgressProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'role' | 'aria-label' | 'aria-valuemin' | 'aria-valuemax' | 'aria-valuenow'
  > {
  /** Accessible name announced with the progress value. */
  label: string;
  /** Current value, 0..max */
  value: number;
  max?: number;
  /** Extra classes for the filled indicator. */
  indicatorClassName?: string;
}

/**
 * Lightweight progress bar (no Radix dependency). Extracted from the
 * gradient bar markup previously duplicated across the checker and home
 * loading cards.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, label, value, max = 100, indicatorClassName, ...props },
    ref
  ) => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
    const safeValue = Number.isFinite(value) ? value : 0;
    const clamped =
      safeMax > 0 ? Math.min(Math.max(safeValue, 0), safeMax) : 0;
    const percent = safeMax > 0 ? (clamped / safeMax) * 100 : 0;

    return (
      <div
        {...props}
        ref={ref}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        className={cn(
          'bg-secondary relative h-2 w-full overflow-hidden rounded-full',
          className
        )}
      >
        <div
          className={cn(
            'bg-primary h-full transition-[width] duration-300',
            indicatorClassName
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
