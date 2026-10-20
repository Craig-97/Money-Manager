import { ArrowRight, Plus } from 'lucide-react';
import { Tile } from '~/components/ui/Tile';
import { formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Accounts } from '../../hooks';

const rowClasses = 'flex items-center gap-3 py-1 md:min-h-16 md:gap-3.5 md:py-1.5';
const iconClasses = 'inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl';

/*
 * What lands on payday: your pay, and money moving between accounts that day. Both start the next
 * cycle, so neither is in the figures beside it.
 */
export const OnPaydayTile = ({ accounts: model }: { accounts: Accounts }) => {
  const { beforePayday, paidInto, cycle, today } = model;
  const hasPay = beforePayday.monthlyIncome > 0 && !!paidInto;

  return (
    <Tile aria-labelledby="accounts-on-payday" className="gap-2 p-4 md:gap-3.5 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="accounts-on-payday"
          className="text-[17px] font-extrabold tracking-[-0.02em] md:text-[15px] md:font-bold md:tracking-normal md:text-muted">
          On payday
        </h2>
        <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold whitespace-nowrap text-accent-text md:px-3.5 md:py-2 md:text-[13px]">
          {formatShortDate(cycle.end, today)}
        </span>
      </div>
      <div>
        {hasPay ? (
          <div className={rowClasses}>
            <span aria-hidden="true" className={`${iconClasses} bg-income-bg text-income`}>
              <Plus size={16} strokeWidth={2.25} />
            </span>
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <span className="text-sm font-bold md:text-[15px]">Pay</span>
              <span className="text-xs font-semibold text-muted">Into {paidInto.name}</span>
            </span>
            <span className="num text-sm font-extrabold text-income md:text-base">
              +{formatMoney(beforePayday.monthlyIncome)}
            </span>
          </div>
        ) : null}
        {beforePayday.onPayday.map(item => (
          <div key={item.key} className={rowClasses}>
            <span
              aria-hidden="true"
              className={`${iconClasses} border border-border bg-surface-2 text-accent-text`}>
              <ArrowRight size={16} />
            </span>
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <span className="text-sm font-bold [overflow-wrap:anywhere] md:text-[15px]">
                {item.payment.name}
              </span>
              <span className="text-xs font-semibold [overflow-wrap:anywhere] text-muted">
                {item.other?.name ?? 'Another account'} to {item.account.name}
              </span>
            </span>
            <span className="num text-sm font-extrabold text-muted md:text-base">
              {formatMoney(item.amount)}
            </span>
          </div>
        ))}
        {hasPay || beforePayday.onPayday.length ? null : (
          <p className="py-3 text-sm font-medium text-muted">Nothing lands on payday.</p>
        )}
      </div>
      {hasPay || beforePayday.onPayday.length ? (
        <p className="mt-auto text-xs leading-[1.45] font-semibold text-muted md:text-[13px] md:leading-normal">
          These land on payday, so they start the next cycle. Neither is taken off the numbers here.
        </p>
      ) : null}
    </Tile>
  );
};
