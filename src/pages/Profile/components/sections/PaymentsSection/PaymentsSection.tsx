import { Label, Select } from '~/components/form';
import { Button } from '~/components/ui';
import { Budget } from '~/hooks/useBudget';
import { cn } from '~/lib/cn';
import { usePaymentSettings } from '../../../hooks';
import { SECTION_ICONS } from '../sectionIcons';
import { helpClasses } from '../settingsClasses';
import { SettingsTile } from '../SettingsTile';

/*
 * How recurring payments are dated: when one that falls on a weekend or bank holiday goes out.
 * A payment can have its own choice, in its form's More options.
 */
export const PaymentsSection = ({ budget }: { budget: Budget }) => {
  const settings = usePaymentSettings(budget);

  return (
    <SettingsTile
      id="payments"
      icon={SECTION_ICONS.payments}
      title="Payments"
      description="How your recurring payments are dated."
      onSubmit={settings.save}
      footer={
        <>
          <span className={helpClasses}>
            Applies now to payments that haven’t gone out yet. You can change it for one payment in
            its form.
          </span>
          <Button
            type="submit"
            variant="accent"
            disabled={!settings.isDirty}
            loading={settings.saving}
            loadingText="Saving…"
            className="font-bold">
            Save changes
          </Button>
        </>
      }>
      <div>
        <Label htmlFor="payments-non-working-day">On a weekend or bank holiday</Label>
        <Select
          id="payments-non-working-day"
          value={settings.rule}
          onValueChange={settings.setRule}
          options={settings.options}
          aria-describedby="payments-non-working-day-help"
        />
        <p id="payments-non-working-day-help" className={cn('mt-2', helpClasses)}>
          {settings.help} {settings.regionText}
        </p>
      </div>
      {settings.examples.length ? (
        <ul aria-label="For example" className="grid gap-2.5 md:grid-cols-2">
          {settings.examples.map(example => (
            <li
              key={example.key}
              className="flex flex-col gap-1 rounded-[18px] border border-border bg-surface-2 px-4 py-3">
              <span className="text-xs font-semibold text-muted">{example.due}</span>
              <span className="num text-[17px] font-extrabold">{example.out}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </SettingsTile>
  );
};
