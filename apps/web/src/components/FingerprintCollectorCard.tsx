'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FingerprintCollectorCardProps {
  title: string;
  hash?: string;
  timing?: number;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export function FingerprintCollectorCard({
  title,
  hash,
  timing,
  children,
  className,
  defaultExpanded = true,
}: FingerprintCollectorCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn('relative', className)}>
      <CardHeader
        className="hover:bg-muted/50 cursor-pointer pb-3 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp className="text-muted-foreground h-5 w-5" />
              ) : (
                <ChevronDown className="text-muted-foreground h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {hash && (
                <code className="text-muted-foreground mt-1 block truncate font-mono text-xs">
                  {hash}
                </code>
              )}
            </div>
          </div>
          {timing !== undefined && (
            <div className="flex-shrink-0 text-right">
              <div className="text-primary text-sm font-semibold">
                {timing.toFixed(2)}ms
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-2 text-sm">{children}</CardContent>
      )}
    </Card>
  );
}

export function DataRow({
  label,
  value,
  mono = false,
  riskLevel,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}) {
  const riskColorClass = riskLevel
    ? riskLevel === 'high'
      ? 'text-red-600 dark:text-red-400'
      : riskLevel === 'medium'
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-green-600 dark:text-green-400'
    : '';

  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'text-right font-medium',
          mono && 'font-mono text-xs',
          riskColorClass
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function DataGrid({
  data,
  className,
}: {
  data: Record<string, React.ReactNode>;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-1', className)}>
      {Object.entries(data).map(([key, value]) => (
        <DataRow key={key} label={key} value={value} />
      ))}
    </div>
  );
}

export function RiskBadge({
  level,
  label,
}: {
  level: 'low' | 'medium' | 'high';
  label: string;
}) {
  const bgColor =
    level === 'high'
      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
      : level === 'medium'
        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800'
        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        bgColor
      )}
    >
      {label}
    </span>
  );
}
