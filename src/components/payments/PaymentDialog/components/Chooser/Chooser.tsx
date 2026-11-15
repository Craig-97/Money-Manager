import { Calendar, Repeat } from 'lucide-react';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { ChoiceList } from '../../../../ui';

const CHOICES = [
  {
    key: 'oneOff' as const,
    Icon: Calendar,
    title: 'One-off payment',
    body: 'A single expense or income on a date'
  },
  {
    key: 'recurring' as const,
    Icon: Repeat,
    title: 'Recurring payment',
    body: 'Bills and subscriptions that repeat'
  }
];

/* "What kind of payment is it?" */
export const Chooser = () => {
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <ChoiceList
      prompt="What kind of payment is it?"
      choices={CHOICES}
      onChoose={kind => openAdd(kind, { fromChooser: true })}
    />
  );
};
