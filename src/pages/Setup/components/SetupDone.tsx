import { Check } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { formatLongDate } from '~/lib/dates';
import { formatBalance } from '~/lib/format';

interface SetupDoneProps {
  cycleEnd: Date;
  freeToSpend: number;
  onReview: () => void;
  onContinue: () => void;
}

/* Shown once the account is saved */
export const SetupDone = ({ cycleEnd, freeToSpend, onReview, onContinue }: SetupDoneProps) => {
  const { user } = useCurrentUser();

  return (
    <div
      role="status"
      className="mx-auto mt-20 flex max-w-[520px] flex-col items-center gap-3.5 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent-text">
        <Check size={30} strokeWidth={2.25} aria-hidden="true" />
      </span>
      <h1 className="mt-1.5 text-4xl font-extrabold tracking-[-0.04em]">
        You're all set{user ? `, ${user.firstName}` : ''}
      </h1>
      <p className="text-[15px] leading-[1.55] text-muted">
        Your first cycle runs until {formatLongDate(cycleEnd, { withYear: false })}, with{' '}
        <span className="num text-text">{formatBalance(freeToSpend)}</span> free to spend. On payday
        we'll ask you to confirm your balance and start the next cycle.
      </p>
      <div className="mt-3 flex gap-2.5">
        <Button size="lg" onClick={onReview} className="font-bold">
          Review setup
        </Button>
        <Button variant="accent" size="lg" onClick={onContinue} className="font-bold">
          Go to dashboard
        </Button>
      </div>
    </div>
  );
};
