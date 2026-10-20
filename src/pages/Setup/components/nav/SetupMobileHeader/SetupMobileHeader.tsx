import { ChevronLeft } from 'lucide-react';
import { BrandMark } from '~/components/ui/BrandMark';
import { IconButton } from '~/components/ui/IconButton';
import { useLogout } from '~/hooks/useLogout';
import { cn } from '~/lib/cn';
import { SetupState } from '../../../hooks';
import { STEPS } from '../../../setupModel';

/*
 * Below 860px: back to the previous step (the logo on the first), which step this is, sign out,
 * and a bar per step. Continue sits in the footer fixed to the bottom.
 */
export const SetupMobileHeader = ({ setup }: { setup: SetupState }) => {
  const logout = useLogout();
  const { step, finished, saving, back } = setup;
  const canGoBack = step > 0 && !finished;

  return (
    <div className="-mx-2 mb-[22px] flex flex-col gap-3 min-[53.75rem]:hidden">
      <div className="flex min-h-11 items-center gap-1">
        {canGoBack ? (
          <IconButton aria-label="Back" onClick={back} disabled={saving}>
            <ChevronLeft size={20} strokeWidth={2.25} aria-hidden="true" />
          </IconButton>
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center">
            <BrandMark />
          </span>
        )}
        <span className="grow text-sm font-bold">
          {finished
            ? 'Setup complete'
            : `Step ${step + 1} of ${STEPS.length} · ${STEPS[step].title}`}
        </span>
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer px-2.5 py-3 text-[13px] font-bold text-accent-text hover:text-text">
          Sign out
        </button>
      </div>
      <div aria-hidden="true" className="flex gap-1.5 px-2">
        {STEPS.map((item, index) => (
          <span
            key={item.title}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              index <= step || finished ? 'bg-accent' : 'bg-track'
            )}
          />
        ))}
      </div>
    </div>
  );
};
