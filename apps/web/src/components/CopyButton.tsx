'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';

interface CopyButtonProps
  extends Pick<ButtonProps, 'variant' | 'size' | 'className' | 'disabled'> {
  /** Text written to the clipboard. */
  value: string;
  /** Visible label; omit for an icon-only button. */
  label?: string;
  /** Accessible name for an icon-only button. */
  ariaLabel?: string;
  /** Toast message on success. */
  successMessage?: string;
  /** Called after a successful copy (e.g. analytics). */
  onCopied?: () => void;
}

/**
 * Shared copy-to-clipboard affordance: icon swap for 2s + sonner toast.
 * Replaces the divergent hand-rolled copy implementations across pages.
 */
export function CopyButton({
  value,
  label,
  ariaLabel,
  successMessage = 'Copied to clipboard',
  onCopied,
  variant = 'ghost',
  size = label ? 'sm' : 'icon',
  className,
  disabled,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const Icon = copied ? Check : Copy;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={copy}
      disabled={disabled}
      aria-label={
        copied
          ? successMessage
          : (ariaLabel ?? label ?? 'Copy to clipboard')
      }
    >
      <Icon className={label ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />
      {label}
    </Button>
  );
}
