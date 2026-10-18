import { Tile } from '~/components/ui/Tile';
import { Account } from '~/hooks/useAccount';
import { formatMoney } from '~/lib/format';
import { useDebts } from '../../hooks';
import { NoDebts } from '../NoDebts';

/* What's left on each debt. The full page, with the payoff plan, comes later. */
export const DebtsContent = ({ account }: { account: Account }) => {
  const { debts, totals } = useDebts(account);

  return (
    <Tile flat aria-labelledby="debts-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="debts-title" className="text-lg font-extrabold tracking-[-0.01em]">
          Your debts
        </h2>
        {debts.length > 0 ? (
          <p className="text-[13px] font-semibold text-muted">
            <span className="num font-bold text-text">{formatMoney(totals.left)}</span> left to pay
          </p>
        ) : null}
      </div>
      {debts.length === 0 ? (
        <NoDebts />
      ) : (
        <ul className="flex flex-col">
          {debts.map(debt => (
            <li
              key={debt.id}
              className="flex items-center justify-between gap-3 border-t border-border py-3.5 first:border-t-0">
              <div className="min-w-0">
                <p className="truncate font-bold">{debt.name}</p>
                <p className="text-[13px] font-medium text-muted">
                  {formatMoney(debt.amount)} a payment · {debt.debt.apr}% APR
                </p>
              </div>
              <p className="shrink-0 num font-bold">{formatMoney(debt.debt.balance)}</p>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
};
