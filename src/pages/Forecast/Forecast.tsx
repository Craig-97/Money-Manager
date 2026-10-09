import { CalendarDays } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { tileLift } from '~/components/ui/Tile';
import { useAccount } from '~/hooks/useAccount';
import { formatMoney } from '~/lib/format';
import { paidText } from '~/lib/payday';
import { ForecastContent, ForecastSkeleton } from './components';

export const Forecast = () => {
  const { account, loading, retry } = useAccount();

  return (
    <>
      <PageHeader
        title="Forecast"
        description="Where your balance is heading if you keep spending at this pace."
        actions={
          account ? (
            <span
              className={`flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-semibold text-muted ${tileLift}`}>
              <CalendarDays size={16} aria-hidden="true" />
              {paidText(account.payday)} ·{' '}
              <span className="num font-bold text-text">
                {formatMoney(account.monthlyIncome, { whole: true })}
              </span>
            </span>
          ) : null
        }
      />
      {account ? (
        <ForecastContent account={account} />
      ) : loading ? (
        <ForecastSkeleton />
      ) : (
        <AccountError onRetry={retry} />
      )}
    </>
  );
};
