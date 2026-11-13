import { Percent } from 'lucide-react';
import { greenTagClasses } from '~/components/payments/PaymentParts';
import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { formatShortDate } from '~/lib/payments';

interface PendingInterestTagProps {
  // "Pending interest £30.25"
  text: string;
  since: Date | null;
  // "tomorrow", "Sun 1 Nov"
  added: string;
  today: Date;
}

/*
 * Desktop: "Pending interest £30.25" under a savings account's name. Hovering or focusing it says
 * how it's worked out and when it's added, as Moved from does for a payment's date.
 */
export const PendingInterestTag = ({ text, since, added, today }: PendingInterestTagProps) => (
  <Tooltip
    side="top"
    tone="card"
    label={
      <>
        <span className="font-bold">
          {since ? `Earned since ${formatShortDate(since, today)}` : 'Earned so far'}
        </span>
        <span>Worked out on each day’s balance, added {added}</span>
        <span className="text-muted">An estimate · update the balance if your bank differs</span>
      </>
    }>
    <span tabIndex={0} className={cn(greenTagClasses, 'h-[22px] gap-[5px] px-2 text-[11px]')}>
      <Percent size={12} strokeWidth={2.25} aria-hidden="true" />
      {text}
    </span>
  </Tooltip>
);
