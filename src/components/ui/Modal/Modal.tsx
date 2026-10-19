import { ReactNode } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useScrollShade } from '~/hooks/useScrollShade';
import { cn } from '~/lib/cn';
import { IconButton } from '../IconButton';
import { footerShade, headerShade, scrollBodyClasses } from './scrollShades';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  // Read out with the title; visually hidden unless the content needs it
  description?: string;
  // Shows a back arrow before the title, e.g. to return to a previous step
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
  // Buttons pinned below the scrolling body
  footer?: ReactNode;
  // Wider on desktop, for a table
  wide?: boolean;
  // The field to focus when it opens, in place of the first control
  initialFocusId?: string;
}

/*
 * A dialog on desktop and a bottom sheet on mobile, from the same markup. Focus is trapped while
 * open, Escape or the backdrop closes it, and focus returns to what opened it.
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  onBack,
  backLabel = 'Back',
  children,
  footer,
  wide = false,
  initialFocusId
}: ModalProps) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { ref: bodyRef, top: shadeTop, bottom: shadeBottom } = useScrollShade();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-90 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          {...(description ? {} : { 'aria-describedby': undefined })}
          onOpenAutoFocus={event => {
            const field = initialFocusId ? document.getElementById(initialFocusId) : null;
            if (!field) return;
            event.preventDefault();
            field.focus();
          }}
          className={cn(
            'fixed z-90 flex flex-col overflow-hidden border border-border bg-surface outline-none',
            isDesktop &&
              (wide ? 'w-[min(640px,calc(100%-32px))]' : 'w-[min(560px,calc(100%-32px))]'),
            isDesktop
              ? 'top-1/2 left-1/2 max-h-[calc(100dvh-48px)] -translate-1/2 rounded-[32px] shadow-[0_40px_90px_-30px_var(--shadow)] data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in'
              : 'inset-x-0 bottom-0 max-h-[min(760px,calc(100dvh-24px))] rounded-t-[28px] border-b-0 pt-2.5 shadow-[0_-20px_48px_-16px_var(--shadow)] data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in'
          )}>
          {isDesktop ? null : (
            <div
              aria-hidden="true"
              className="mb-3 h-[5px] w-10 shrink-0 self-center rounded-full bg-border-strong"
            />
          )}

          <div
            className={cn(
              'flex shrink-0 items-center gap-2',
              headerShade(shadeTop),
              isDesktop ? 'pt-5 pr-[18px] pb-2' : 'px-4 pb-1',
              isDesktop && (onBack ? 'pl-3.5' : 'pl-7')
            )}>
            {onBack ? (
              <IconButton aria-label={backLabel} onClick={onBack}>
                <ChevronLeft size={20} strokeWidth={2.25} aria-hidden="true" />
              </IconButton>
            ) : null}
            <Dialog.Title
              className={cn(
                'm-0 flex-1 leading-[1.2] font-extrabold tracking-[-0.03em]',
                isDesktop ? 'text-[22px]' : 'pl-1 text-xl'
              )}>
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton aria-label="Close" variant={isDesktop ? 'outline' : 'ghost'}>
                <X size={18} strokeWidth={2.25} aria-hidden="true" />
              </IconButton>
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="sr-only">{description}</Dialog.Description>
          ) : null}

          <div
            ref={bodyRef}
            className={cn(
              'flex flex-col gap-[18px]',
              scrollBodyClasses,
              isDesktop ? 'px-7 pt-2.5 pb-6' : 'px-4 pt-3 pb-[18px]'
            )}>
            {children}
          </div>

          {footer ? (
            <div
              className={cn(
                'flex shrink-0 items-center gap-2 bg-surface px-5 pt-4',
                footerShade(shadeBottom),
                isDesktop ? 'pb-5' : 'pb-[calc(16px+env(safe-area-inset-bottom))]'
              )}>
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
