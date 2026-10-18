import { Bell as BellIcon } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { popoverClasses } from '~/components/ui/popoverClasses';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { cn } from '~/lib/cn';
import { BellPanel } from '../BellPanel';
import { BellSheet } from '../BellSheet';
import { useBell } from './useBell';

const bellClasses =
  'relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:bg-hover hover:text-text aria-expanded:border-accent aria-expanded:text-text aria-expanded:shadow-[0_0_0_3px_var(--accent-soft)]';

/*
 * The bell in the page header, with how many reminders are new. It opens what's new: a panel
 * under it on desktop, a bottom sheet on mobile.
 */
export const ReminderBell = ({ className }: { className?: string }) => {
  const bell = useBell();
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const label = bell.unread ? `Reminders, ${bell.unread} new` : 'Reminders';
  const badge = bell.unread ? (
    <span
      aria-hidden="true"
      className="absolute -top-[3px] -right-[3px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-bg bg-expense px-[5px] num text-[10px] font-extrabold text-white">
      {bell.unread > 99 ? '99+' : bell.unread}
    </span>
  ) : null;

  if (!isDesktop) {
    return (
      <>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={bell.open}
          onClick={() => bell.setOpen(true)}
          className={cn(bellClasses, className)}>
          <BellIcon size={19} aria-hidden="true" />
          {badge}
        </button>
        <BellSheet bell={bell} />
      </>
    );
  }

  return (
    <Popover.Root open={bell.open} onOpenChange={bell.setOpen}>
      <Popover.Trigger aria-label={label} className={cn(bellClasses, className)}>
        <BellIcon size={19} aria-hidden="true" />
        {badge}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          collisionPadding={16}
          aria-label="Reminders"
          // Focus goes to the panel, not its first button, so a stray key can't mark everything read
          tabIndex={-1}
          onOpenAutoFocus={event => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
          className={cn(
            popoverClasses,
            'z-80 w-[500px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[28px]'
          )}>
          <BellPanel bell={bell} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
