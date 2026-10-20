import { Tile } from '~/components/ui/Tile';
import { formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Accounts } from '../../hooks';

const rowClasses =
  'flex items-start justify-between gap-3 border-t border-border py-3 first:border-t-0';

/* What lands on payday: your pay, and money moving between accounts that day */
export const OnPaydayTile = ({ accounts: model }: { accounts: Accounts }) => {
  const { beforePayday, paidInto, cycle, today } = model;

  return (
    <Tile flat aria-labelledby="accounts-on-payday" className="gap-1 md:gap-1">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2 id="accounts-on-payday" className="text-[17px] font-extrabold tracking-[-0.02em]">
          On payday
        </h2>
        <span className="text-[13px] font-semibold text-muted">
          {formatShortDate(cycle.end, today)}
        </span>
      </div>
      <div className="px-1">
        {beforePayday.monthlyIncome > 0 && paidInto ? (
          <div className={rowClasses}>
            <span className="text-sm font-semibold">
              Your pay into <span className="font-bold">{paidInto.name}</span>
            </span>
            <span className="num text-sm font-extrabold text-income">
              +{formatMoney(beforePayday.monthlyIncome)}
            </span>
          </div>
        ) : null}
        {beforePayday.onPayday.map(item => (
          <div key={item.key} className={rowClasses}>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-bold [overflow-wrap:anywhere]">
                {item.payment.name}
              </span>
              <span className="text-xs font-semibold text-muted">
                {item.other ? `From ${item.other.name}` : 'Moves money'} · counts in the next cycle
              </span>
            </span>
            <span className="num text-sm font-extrabold">{formatMoney(item.amount)}</span>
          </div>
        ))}
        {beforePayday.monthlyIncome > 0 || beforePayday.onPayday.length ? null : (
          <p className="py-3 text-sm font-medium text-muted">Nothing lands on payday.</p>
        )}
      </div>
    </Tile>
  );
};
