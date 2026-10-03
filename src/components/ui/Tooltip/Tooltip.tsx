import { ReactElement } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
  label: string;
  children: ReactElement;
  side?: TooltipPrimitive.TooltipContentProps['side'];
  // Never shows, e.g. when the trigger's label is already visible. The trigger stays mounted
  // either way, so switching this doesn't move focus.
  disabled?: boolean;
}

export const Tooltip = ({ label, children, side = 'right', disabled = false }: TooltipProps) => (
  <TooltipPrimitive.Root open={disabled ? false : undefined}>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={side}
        sideOffset={14}
        className="z-70 animate-fade-in rounded-xl bg-text px-3 py-2 text-[13px] leading-[1.2] font-semibold whitespace-nowrap text-bg">
        {label}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>
);

export const TooltipProvider = TooltipPrimitive.Provider;
