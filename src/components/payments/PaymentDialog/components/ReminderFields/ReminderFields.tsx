import { cn } from '~/lib/cn';
import { Label, Select } from '../../../../form';
import { PaymentForm } from '../../usePaymentForm';

/*
 * When to be reminded before it's due, and before it renews when it does, or before a debt's rate
 * ends. Under More options.
 */
export const ReminderFields = ({ form }: { form: PaymentForm }) => {
  const { values, set, reminderOptions, renewalReminder } = form;
  const { reminds } = form.more;

  return (
    <div className={cn(reminds && 'grid gap-[18px] md:grid-cols-2 md:gap-3.5')}>
      <div>
        <Label tone="muted" htmlFor="payment-due-reminder">
          Remind me before it’s due
        </Label>
        <Select
          id="payment-due-reminder"
          value={values.dueReminder}
          onValueChange={value => set('dueReminder', value)}
          options={reminderOptions.due}
          className="bg-surface"
        />
      </div>
      {reminds ? (
        <div>
          <Label tone="muted" htmlFor="payment-reminder">
            {renewalReminder.label}
          </Label>
          <Select
            id="payment-reminder"
            value={renewalReminder.value}
            onValueChange={value => set('reminder', value)}
            options={reminderOptions.renewal}
            className="bg-surface"
          />
        </div>
      ) : null}
    </div>
  );
};
