import { useRef, useState } from 'react';
import { matchPath, useLocation } from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { preloadPage } from '~/app/routes/pageModules';
import { MoreIcon } from '~/components/icons';
import { cn } from '~/lib/cn';
import { MoreSheet } from '../MoreSheet';
import { MORE_LINKS } from './moreLinks';

/*
 * The mobile nav's last button. It opens a sheet above the nav with the pages that don't fit in
 * the bar, over a dimmed page, and it's marked as current on any page it opens.
 */
export const MoreMenu = () => {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  // A debt's own page counts as Debts
  const current = MORE_LINKS.find(link => matchPath({ path: link.to, end: false }, pathname));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          aria-label="More"
          // Says which of its pages is showing, as the other nav links do
          aria-description={current ? `On ${current.label}` : undefined}
          data-current={current ? '' : undefined}
          onFocus={() => MORE_LINKS.forEach(link => preloadPage(link.page))}
          className={cn(
            'flex h-[52px] w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-nav-icon hover:text-nav-active-bg',
            'aria-expanded:bg-nav-active-bg aria-expanded:text-nav-active-text data-current:bg-nav-active-bg data-current:text-nav-active-text'
          )}>
          <MoreIcon size={22} strokeWidth={1.9} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Under the nav, so the nav stays clear while the page dims */}
        <Dialog.Overlay className="fixed inset-0 z-35 bg-overlay data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          // The More button closes it; without this its press would close and reopen it
          onPointerDownOutside={event => {
            if (trigger.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className="fixed inset-x-3 bottom-[calc(104px+env(safe-area-inset-bottom))] z-45 rounded-[28px] border border-border bg-surface px-[18px] py-2 shadow-[0_30px_60px_-20px_var(--shadow)] outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in">
          <Dialog.Title className="sr-only">More</Dialog.Title>
          <MoreSheet links={MORE_LINKS} current={current} onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
