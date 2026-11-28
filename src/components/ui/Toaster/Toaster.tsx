import { X } from 'lucide-react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '~/lib/cn';
import { useToastStore } from '~/state/toast';
import { buttonVariants } from '../Button';

const TOAST_DURATION_MS = 5000;

interface ToasterProps {
  // Extra classes for where the stack sits, e.g. clearing the mobile nav
  className?: string;
}

/*
 * Shows toasts from showToast() as dark pills at the bottom of the screen. They're announced to
 * screen readers, pause while hovered or focused, and can be swiped away.
 */
export const Toaster = ({ className }: ToasterProps) => {
  const { toasts, dismiss } = useToastStore(
    useShallow(s => ({ toasts: s.toasts, dismiss: s.dismiss }))
  );

  return (
    <ToastPrimitive.Provider
      duration={TOAST_DURATION_MS}
      swipeDirection="down"
      label="Notification">
      {toasts.map(toast => (
        <ToastPrimitive.Root
          key={toast.id}
          onOpenChange={open => {
            if (!open) dismiss(toast.id);
          }}
          className="flex min-h-14 items-center gap-3.5 rounded-full bg-pill-active-bg py-1.5 pr-1.5 pl-5 text-sm font-semibold text-pill-active-text shadow-[0_20px_40px_-16px_var(--shadow)] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in data-[swipe=move]:translate-y-(--radix-toast-swipe-move-y)">
          {toast.icon ? (
            <span className="shrink-0 [&_svg]:size-[18px]" aria-hidden="true">
              {toast.icon}
            </span>
          ) : null}
          <ToastPrimitive.Description className="min-w-0 flex-1">
            {toast.message}
          </ToastPrimitive.Description>
          {toast.action ? (
            <ToastPrimitive.Action altText={toast.action.label} asChild>
              <button
                type="button"
                onClick={toast.action.onClick}
                className={buttonVariants({ variant: 'accent' })}>
                {toast.action.label}
              </button>
            </ToastPrimitive.Action>
          ) : null}
          <ToastPrimitive.Close
            aria-label="Dismiss"
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full opacity-70 hover:opacity-100">
            <X size={16} strokeWidth={2.25} aria-hidden="true" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport
        className={cn(
          'fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-95 m-0 flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 list-none flex-col gap-2 p-0 outline-none',
          className
        )}
      />
    </ToastPrimitive.Provider>
  );
};
