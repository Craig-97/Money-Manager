import { ReactElement, ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '~/lib/cn';
import { hintCardClasses } from '../popoverClasses';

interface TooltipProps {
  label: ReactNode;
  children: ReactElement;
  // label: a dark label, for icons in the navigation. card: a light card of details on the page,
  // matching the cycle bar's days.
  tone?: 'label' | 'card';
  side?: TooltipPrimitive.TooltipContentProps['side'];
  // Never shows, e.g. when the trigger's label is already visible. The trigger stays mounted
  // either way, so switching this doesn't move focus.
  disabled?: boolean;
}

export const Tooltip = ({
  label,
  children,
  side = 'right',
  tone = 'label',
  disabled = false
}: TooltipProps) => (
  // A card closes as soon as the pointer leaves what it's about, as the cycle bar's days do
  <TooltipPrimitive.Root
    open={disabled ? false : undefined}
    disableHoverableContent={tone === 'card'}>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={side}
        sideOffset={tone === 'card' ? 6 : 14}
        className={cn(
          'z-70 animate-fade-in',
          tone === 'card'
            ? cn('pointer-events-none', hintCardClasses)
            : 'rounded-xl bg-text px-3 py-2 text-[13px] leading-[1.2] font-semibold whitespace-nowrap text-bg'
        )}>
        {label}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
);

export const TooltipProvider = TooltipPrimitive.Provider;
