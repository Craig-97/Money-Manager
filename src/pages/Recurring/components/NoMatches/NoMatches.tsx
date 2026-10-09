import { Plus, Repeat, SearchX } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { usePaymentDialogStore } from '~/state/paymentDialog';

/*
 * Nothing listed: no recurring payments at all, or none that fit the search, category and tab.
 */
export const NoMatches = ({ none }: { none: boolean }) => {
  const openAdd = usePaymentDialogStore(s => s.openAdd);
  const Icon = none ? Repeat : SearchX;

  return (
    <div className="flex flex-col items-center gap-1.5 border-t border-border px-3 pt-7 pb-6 text-center md:px-4 md:pt-9 md:pb-8">
      <span
        aria-hidden="true"
        className="mb-2 inline-flex size-[52px] items-center justify-center rounded-[18px] bg-accent-soft text-accent-text">
        <Icon size={24} />
      </span>
      <p className="text-base font-extrabold tracking-[-0.01em]">
        {none ? 'No recurring payments yet' : 'No payments match'}
      </p>
      <p className="mb-2.5 text-[13px] font-medium text-muted">
        {none
          ? 'Bills and subscriptions that repeat will show here'
          : 'Try another search or category'}
      </p>
      {none ? (
        <Button variant="accent" onClick={() => openAdd('recurring')}>
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Add recurring payment
        </Button>
      ) : null}
    </div>
  );
};
