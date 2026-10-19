import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { formatMoney } from '~/lib/format';
import { PaydayPrompt } from '../../../hooks/usePaydayPrompt';

/* A payment due from payday to today, ticked if it has already gone out */
export const DueSinceRow = ({ item }: { item: PaydayPrompt['dueSince'][number] }) => {
  const id = `payday-gone-${item.key.replace(':', '-')}`;
  return (
    <div className="flex min-h-[60px] items-center gap-2 border-t border-border py-2 pr-3.5 pl-0.5 first:border-t-0 md:pl-1">
      <CheckboxHitArea htmlFor={id}>
        <Checkbox id={id} size="md" checked={item.ticked} onChange={item.toggle} />
      </CheckboxHitArea>
      <label htmlFor={id} className="min-w-0 grow cursor-pointer">
        <span className="block text-[15px] font-bold">{item.payment.name}</span>
        <span className="mt-0.5 block text-xs font-medium text-muted">{item.detail}</span>
      </label>
      <span className="shrink-0 num text-[15px] font-extrabold whitespace-nowrap text-expense">
        {formatMoney(item.payment.amount * item.dates.length)}
      </span>
    </div>
  );
};
