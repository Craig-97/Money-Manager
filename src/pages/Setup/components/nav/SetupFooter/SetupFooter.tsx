import { ChevronLeft, CircleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { SetupState } from '../../../hooks';
import { isStepValid, LAST_STEP } from '../../../setupModel';

/* Back, skip and continue, plus the error if saving failed */
export const SetupFooter = ({ setup }: { setup: SetupState }) => {
  const { step, values, showErrors, saving, saveFailed, canSkip, back, skip, next, retry } = setup;
  const isLast = step === LAST_STEP;
  // After a failed Continue the button looks disabled until the problems are fixed
  const blocked = showErrors && !isStepValid(step, values);

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
      <footer className="flex items-center gap-2.5 pt-1">
        {step > 0 ? (
          <Button size="lg" onClick={back} disabled={saving} className="font-bold">
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" />
            Back
          </Button>
        ) : null}
        <div className="grow" />
        {canSkip ? (
          <Button variant="ghost" size="lg" onClick={skip} className="font-bold">
            Skip for now
          </Button>
        ) : null}
        <Button
          variant={blocked ? 'default' : 'accent'}
          size="lg"
          onClick={next}
          loading={saving}
          loadingText={isLast ? 'Saving…' : undefined}
          aria-disabled={blocked || undefined}
          className={
            blocked
              ? 'cursor-not-allowed bg-surface-2 font-bold text-muted hover:bg-surface-2'
              : 'font-bold'
          }>
          {isLast ? 'Finish setup' : 'Continue'}
        </Button>
      </footer>
    </>
  );
};
