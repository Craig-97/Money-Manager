import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { LeftOverOutcome } from '~/graphql/generated';
import { formatMoney } from '~/lib/format';
import { PaydayPrompt } from '../../../hooks/usePaydayPrompt';

const OPTIONS: { value: LeftOverOutcome; label: string }[] = [
  { value: 'PAID', label: 'Paid' },
  { value: 'SKIPPED', label: 'Didn’t go out' },
  { value: 'DUE', label: 'Still to pay' }
];

/* A payment from last cycle never marked paid or skipped, and what happened to it */
export const LeftOverRow = ({ item }: { item: PaydayPrompt['leftOver'][number] }) => {
  const { payment, dates } = item;
  return (
    <div className="flex flex-col gap-2.5 border-t border-border px-4 py-3.5 first:border-t-0">
      <div className="flex items-center gap-3">
        <span className="min-w-0 grow">
          <span className="block text-[15px] font-bold">{payment.name}</span>
          <span className="mt-0.5 block text-xs font-medium text-muted">{item.detail}</span>
        </span>
        <span className="shrink-0 num text-[15px] font-extrabold whitespace-nowrap text-expense">
          {formatMoney(payment.amount * dates.length)}
        </span>
      </div>
      <SegmentedControl
        aria-label={`What happened to ${payment.name}`}
        value={item.outcome}
        onValueChange={item.setOutcome}
        options={OPTIONS}
        size="md"
        fullWidth
        className="bg-surface *:flex-1"
      />
      {item.note ? (
        <p className="text-xs leading-snug font-semibold text-muted">{item.note}</p>
      ) : null}
    </div>
  );
};
