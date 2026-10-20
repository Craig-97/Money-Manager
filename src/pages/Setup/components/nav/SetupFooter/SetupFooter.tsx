import { ChevronLeft, CircleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { SetupState, useSetupDesktop } from '../../../hooks';
import { isStepValid, LAST_STEP } from '../../../setupModel';

/*
 * Back, skip and continue, plus the error if saving failed. On mobile Continue fills a bar fixed to
 * the bottom of the screen, with Skip under it; Back is the arrow in the header.
 */
export const SetupFooter = ({ setup }: { setup: SetupState }) => {
  const isDesktop = useSetupDesktop();
  const { step, values, showErrors, saving, saveFailed, canSkip, back, skip, next, retry } = setup;
  const isLast = step === LAST_STEP;
  // After a failed Continue the button looks disabled until the problems are fixed
  const blocked = showErrors && !isStepValid(step, values);

  const skipButton = canSkip ? (
    <Button
      variant="ghost"
      size={isDesktop ? 'lg' : 'xl'}
      onClick={skip}
      className={isDesktop ? 'font-bold' : 'h-[52px] w-full'}>
      Skip for now
    </Button>
  ) : null;
  const continueButton = (
    <Button
      variant={blocked ? 'default' : 'accent'}
      size={isDesktop ? 'lg' : 'xl'}
      onClick={next}
      loading={saving}
      loadingText={isLast ? 'Saving…' : undefined}
      aria-disabled={blocked || undefined}
      className={cn(
        'font-bold',
        !isDesktop && 'h-[52px] w-full',
        blocked && 'cursor-not-allowed bg-surface-2 text-muted hover:bg-surface-2'
      )}>
      {isLast ? 'Finish setup' : 'Continue'}
    </Button>
  );

  return (
    <>
      {isLast && saveFailed ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-[20px] border border-expense bg-expense-bg px-4 py-3.5">
          <CircleAlert size={20} className="shrink-0 text-expense" aria-hidden="true" />
          <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
            <p className="text-sm font-extrabold">We couldn't save your setup</p>
            <p className="text-[13px] leading-normal">
              Something went wrong on our side. Your answers are still here.
            </p>
          </div>
          <Button size="lg" onClick={retry} className="font-bold">
            Try again
          </Button>
        </div>
      ) : null}
      {isDesktop ? (
        <footer className="flex items-center gap-2.5 pt-1">
          {step > 0 ? (
            <Button size="lg" onClick={back} disabled={saving} className="font-bold">
              <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" />
              Back
            </Button>
          ) : null}
          <div className="grow" />
          {skipButton}
          {continueButton}
        </footer>
      ) : (
        <footer className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 border-t border-border bg-surface px-4 pt-3.5 pb-[max(24px,env(safe-area-inset-bottom))]">
          {continueButton}
          {skipButton}
        </footer>
      )}
    </>
  );
};
