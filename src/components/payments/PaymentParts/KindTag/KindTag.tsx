import { Calendar, Repeat } from 'lucide-react';
import { Payment } from '~/lib/payments';
import { tagClasses } from '../tagClasses';

/* Recurring or one-off, with its icon */
export const KindTag = ({ payment }: { payment: Payment }) =>
  payment.kind === 'recurring' ? (
    <span className={tagClasses}>
      <Repeat size={13} strokeWidth={2.25} aria-hidden="true" />
      Recurring
    </span>
  ) : (
    <span className={tagClasses}>
      <Calendar size={13} strokeWidth={2.25} aria-hidden="true" />
      One-off
    </span>
  );
