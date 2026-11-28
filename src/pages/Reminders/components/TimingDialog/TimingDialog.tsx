import { useState } from 'react';
import { ChipGroup, Modal, ModalActions } from '~/components/ui';
import {
  fromTimingChoice,
  PAYMENT_REMINDER_DAYS,
  rateEndsTimingOptions,
  RENEWAL_REMINDER_DAYS,
  TimingChoice,
  timingOptions,
  toRateEndsChoice,
  toTimingChoice
} from '~/lib/payments';
import { Reminder, timingOf } from '~/lib/reminders';
import { RemindersPage } from '../../hooks';

/*
 * Change when: one payment's reminder before it's due, before it renews or before its rate ends. The
 * usual timing, a number of days, or off.
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
    const timing = timingOf(changing);
    if (timing) {
      setChoice(
        changing.kind === 'rateEnds'
          ? toRateEndsChoice(toTimingChoice(timing))
          : toTimingChoice(timing)
      );
    }
  }

  const reminder = changing ?? shown;
  const payment = reminder?.payment;
  const due = reminder?.kind === 'due';
  const rateEnds = reminder?.kind === 'rateEnds';
  const options = due
    ? timingOptions({ days: PAYMENT_REMINDER_DAYS, usual: settings.paymentDays })
    : rateEnds
      ? rateEndsTimingOptions
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
        <ModalActions
          cancel={{ onClick: page.stopChanging }}
          confirm={{ label: 'Save', onClick: () => void save(), loading: saving }}
        />
      }>
      <div>
        <p id="timing-choice" className="mb-2 text-[13px] font-bold text-muted">
          {due ? 'Before each payment' : rateEnds ? 'Before the rate ends' : 'Before it renews'}
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
