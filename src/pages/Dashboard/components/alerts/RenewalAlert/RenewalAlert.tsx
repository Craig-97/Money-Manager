import { PenLine, RefreshCw } from 'lucide-react';
import { Alert } from '~/components/alerts';
import { formatMoney } from '~/lib/format';
import {
  formatShortDate,
  PER_PERIOD,
  RecurringPayment,
  Renewal,
  renewalHeading
} from '~/lib/payments';

interface RenewalAlertProps {
  payment: RecurringPayment;
  renewal: Renewal;
  today: Date;
  onLater: () => void;
  onUpdate: () => void;
  onClear: () => void;
}

/* A renewal coming up, or gone by: check the price, and set the next date once it's renewed */
export const RenewalAlert = ({
  payment,
  renewal,
  today,
  onLater,
  onUpdate,
  onClear
}: RenewalAlertProps) => {
  const heading = renewalHeading(payment, { renewal, today });
  return (
    <Alert
      icon={RefreshCw}
      tone="accent"
      title={heading}
      subline={
        <>
          {formatShortDate(renewal.date, today)} ·{' '}
          <span className="num">{formatMoney(payment.amount)}</span> {PER_PERIOD[payment.frequency]}{' '}
          ·{' '}
          {renewal.passed ? (
            'check the price and next date'
          ) : (
            <>
              check the price<span className="hidden md:inline"> before it renews</span>
            </>
          )}
        </>
      }
      onLater={onLater}
      action={{ label: 'Update', icon: PenLine, onClick: onUpdate, opensDialog: true }}
      onClear={onClear}
      clearLabel={heading}
    />
  );
};
