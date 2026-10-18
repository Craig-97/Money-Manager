import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { ChipGroup } from '~/components/ui/ChipGroup';
import { Modal } from '~/components/ui/Modal';
import {
  fromTimingChoice,
  PAYMENT_REMINDER_DAYS,
  RENEWAL_REMINDER_DAYS,
  TimingChoice,
  timingOptions,
  toTimingChoice
} from '~/lib/payments';
import { Reminder } from '~/lib/reminders';
import { RemindersPage } from '../../hooks';

/*
 * Change when: one payment's reminder before it's due, or before it renews. The usual timing, a
 * number of days, or off.
 */
export const TimingDialog = ({ page }: { page: RemindersPage }) => {
  // What it was opened for, kept while it closes so it reads the same as it animates away
  const [shown, setShown] = useState<Reminder | null>(null);
  const [choice, setChoice] = useState<TimingChoice>('usual');
  const [saving, setSaving] = useState(false);
  const { changing, settings } = page;

  // A new opening starts from the payment's timing (React's "reset state on a prop change" pattern)
  if (changing && changing !== shown) {
    setShown(changing);
    const payment = changing.payment;
    if (payment) {
      setChoice(
        toTimingChoice(
          changing.kind === 'renewal' && payment.kind === 'recurring'
            ? payment.renewalReminder
            : payment.dueReminder
        )
      );
    }
  }

  const reminder = changing ?? shown;
  const payment = reminder?.payment;
  const due = reminder?.kind === 'due';
  const options = due
    ? timingOptions({ days: PAYMENT_REMINDER_DAYS, usual: settings.paymentDays })
    : timingOptions({ days: RENEWAL_REMINDER_DAYS, usual: settings.renewalDays });

  const save = async () => {
    if (!payment) return;
    setSaving(true);
    const saved = await page.actions.changeTiming(payment, {
      which: due ? 'dueReminder' : 'renewalReminder',
      timing: fromTimingChoice(choice)
    });
    setSaving(false);
    if (saved) page.stopChanging();
  };

  return (
    <Modal
      open={!!changing}
      onOpenChange={open => (open ? undefined : page.stopChanging())}
      title={payment ? `Remind me about ${payment.name}` : 'Change when'}
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={page.stopChanging} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => void save()}
            loading={saving}
            className="max-md:h-[52px]">
            Save
          </Button>
        </>
      }>
      <div>
        <p id="timing-choice" className="mb-2 text-[13px] font-bold text-muted">
          {due ? 'Before each payment' : 'Before it renews'}
        </p>
        <ChipGroup
          type="single"
          aria-labelledby="timing-choice"
          value={choice}
          onValueChange={setChoice}
          options={options}
        />
      </div>
    </Modal>
  );
};
