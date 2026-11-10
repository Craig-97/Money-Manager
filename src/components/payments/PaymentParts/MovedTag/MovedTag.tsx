import { CalendarDays } from 'lucide-react';
import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { MovedDate } from '~/lib/payments';
import { accentTagClasses } from '../tagClasses';

/*
 * "Moved from Sat 24 Oct" under a payment's date, when it was moved off a weekend or bank holiday.
 * Hovering or focusing it says why, and where to change it.
 */
export const MovedTag = ({ moved }: { moved: MovedDate }) => (
  <Tooltip
    side="top"
    tone="card"
    label={
      <>
        <span className="font-bold">{moved.reason}</span>
        <span>{moved.outcome}</span>
        <span className="text-muted">Change this in the payment or in Profile</span>
      </>
    }>
    <span tabIndex={0} className={cn(accentTagClasses, 'h-[22px] gap-[5px] px-2 text-[11px]')}>
      <CalendarDays size={12} strokeWidth={2.25} aria-hidden="true" />
      {moved.label}
    </span>
  </Tooltip>
);
