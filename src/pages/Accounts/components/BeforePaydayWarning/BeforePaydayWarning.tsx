import { AlertTriangle } from 'lucide-react';
import { AccountBeforePayday, goesBelowZero } from '~/lib/accounts';
import { formatShortDate } from '~/lib/dates';
import { formatBalance } from '~/lib/format';

/*
 * The warning at the top of an account's list when it's already below £0, or would go below
 * before payday. Nothing when it stays above.
 */
export const BeforePaydayWarning = ({ row, today }: { row: AccountBeforePayday; today: Date }) => {
  const { account, lowest } = row;

  const warning =
    account.balance < 0
      ? {
          headline: 'Already below £0',
          amount: account.balance,
          // And going further down before payday
          rest:
            lowest && lowest.amount < account.balance
              ? `Move money in to cover it before ${formatShortDate(lowest.date, today)}, when it goes down to ${formatBalance(lowest.amount)}.`
              : 'Move money in to cover it.'
        }
      : lowest && goesBelowZero(row)
        ? {
            headline: `Goes below £0 on ${formatShortDate(lowest.date, today)}`,
            amount: lowest.amount,
            rest: 'Move money in before then.'
          }
        : null;
  if (!warning) return null;

  return (
    <p className="mb-1 flex items-start gap-2.5 rounded-2xl bg-warn-bg px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-warn">
      <AlertTriangle size={16} className="mt-px shrink-0" aria-hidden="true" />
      <span>
        <b>
          {warning.headline}{' '}
          <span className="whitespace-nowrap">({formatBalance(warning.amount)}).</span>
        </b>{' '}
        {warning.rest}
      </span>
    </p>
  );
};
