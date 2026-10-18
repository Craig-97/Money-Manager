import { ChipGroup } from '~/components/ui/ChipGroup';
import { PAYMENT_REMINDER_DAYS, RENEWAL_REMINDER_DAYS, daysBeforeText } from '~/lib/payments';
import { RemindersPage } from '../../hooks';

const PAYMENT_OPTIONS = PAYMENT_REMINDER_DAYS.map(days => ({
  value: String(days),
  label: daysBeforeText(days)
}));

const RENEWAL_OPTIONS = RENEWAL_REMINDER_DAYS.map(days => ({
  value: String(days),
  label: daysBeforeText(days)
}));

const PAYDAY_OPTIONS = [
  { value: 'on', label: 'On the day' },
  { value: 'off', label: 'Off' }
];

const groupLabel = 'mb-2 text-[13px] font-bold text-muted';

/*
 * When reminders go off for anything without its own timing. Each change saves straight away.
 * A payment or renewal can have its own from its menu under Coming up.
 */
export const UsualTiming = ({ page }: { page: RemindersPage }) => {
  const { settings, actions } = page;
  const change = (changes: Parameters<typeof actions.changeSettings>[0]) =>
    void actions.changeSettings(changes, settings);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-muted">
        Used for anything new. Change one reminder from its own menu under Coming up.
      </p>
      <div>
        <p id="timing-payments" className={groupLabel}>
          Payments
        </p>
        <ChipGroup
          type="single"
          aria-labelledby="timing-payments"
          value={String(settings.paymentDays)}
          onValueChange={value => change({ paymentDays: Number(value) })}
          options={PAYMENT_OPTIONS}
        />
        <p className="mt-2 ml-1 text-xs leading-[1.45] font-semibold text-muted">
          A payment’s reminder goes once you mark it paid or skip it. Still unpaid after its date,
          it shows as overdue and stays in New until you do.
        </p>
      </div>
      <div>
        <p id="timing-renewals" className={groupLabel}>
          Renewals
        </p>
        <ChipGroup
          type="single"
          aria-labelledby="timing-renewals"
          value={String(settings.renewalDays)}
          onValueChange={value => change({ renewalDays: Number(value) })}
          options={RENEWAL_OPTIONS}
        />
      </div>
      <div>
        <p id="timing-payday" className={groupLabel}>
          Payday
        </p>
        <ChipGroup
          type="single"
          aria-labelledby="timing-payday"
          value={settings.payday ? 'on' : 'off'}
          onValueChange={value => change({ payday: value === 'on' })}
          options={PAYDAY_OPTIONS}
        />
      </div>
    </div>
  );
};
