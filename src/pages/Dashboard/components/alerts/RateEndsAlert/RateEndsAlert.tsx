import { PenLine, Percent } from 'lucide-react';
import { Alert } from '~/components/alerts';
import { RateEnd, rateEndHeading, RecurringPayment } from '~/lib/payments';

interface RateEndsAlertProps {
  payment: RecurringPayment;
  rateEnd: RateEnd;
  onLater: () => void;
  onUpdate: () => void;
  onClear: () => void;
}

/* A debt's rate ending soon, or gone by: check the new rate and payment, and set when it ends */
export const RateEndsAlert = ({
  payment,
  rateEnd,
  onLater,
  onUpdate,
  onClear
}: RateEndsAlertProps) => {
  const heading = rateEndHeading(payment, rateEnd);
  return (
    <Alert
      icon={Percent}
      tone="accent"
      title={heading}
      subline="Check your new rate and payment"
      onLater={onLater}
      action={{ label: 'Update rate', icon: PenLine, onClick: onUpdate, opensDialog: true }}
      onClear={onClear}
      clearLabel={heading}
    />
  );
};
