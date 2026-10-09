import { PenLine, RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { formatMoney } from '~/lib/format';
import {
  formatShortDate,
  PER_PERIOD,
  RecurringPayment,
  Renewal,
  renewalHeading
} from '~/lib/payments';
import { laterClasses } from '../alertClasses';

interface RenewalAlertProps {
  payment: RecurringPayment;
  renewal: Renewal;
  today: Date;
  onLater: () => void;
  onUpdate: () => void;
}

/* A renewal coming up, or gone by: check the price, and set the next date once it's renewed */
export const RenewalAlert = ({ payment, renewal, today, onLater, onUpdate }: RenewalAlertProps) => (
  <>
    <div className="flex min-w-[200px] grow items-center gap-3 md:gap-4">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text md:size-11">
        <RefreshCw size={20} className="size-[18px] md:size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-bold">{renewalHeading(payment, renewal, today)}</p>
        <p className="mt-0.5 text-xs font-medium text-muted md:text-[13px]">
          {formatShortDate(renewal.date, today)} ·{' '}
          <span className="num">{formatMoney(payment.amount)}</span> {PER_PERIOD[payment.frequency]}{' '}
          · {renewal.passed ? 'check the price and next date' : 'check the price before it renews'}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 md:flex md:gap-1.5">
      <Button onClick={onLater} className={laterClasses}>
        Later
      </Button>
      <Button variant="solid" onClick={onUpdate}>
        <PenLine size={16} aria-hidden="true" />
        Update
      </Button>
    </div>
  </>
);
