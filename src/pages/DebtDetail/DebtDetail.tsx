import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { OverpaymentDialog } from '~/components/debts';
import { AccountError } from '~/components/feedback/AccountError';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Skeleton } from '~/components/ui/Skeleton';
import { ROUTES } from '~/constants';
import { Account, useAccount } from '~/hooks/useAccount';
import { DebtDetails, DebtPayments, DetailHeader, DetailHero, PaySooner } from './components';
import { useDebtDetail } from './hooks';

type DetailTab = 'sooner' | 'payments' | 'details';

const TABS: { value: DetailTab; label: string }[] = [
  { value: 'sooner', label: 'Pay sooner' },
  { value: 'payments', label: 'Payments' },
  { value: 'details', label: 'Details' }
];

const DetailContent = ({ account, id }: { account: Account; id: string }) => {
  const detail = useDebtDetail(account, id);
  const [tab, setTab] = useState<DetailTab>('sooner');

  // Deleted, or no longer tracked as a debt: back to the list
  if (!detail) return <Navigate to={ROUTES.debts} replace />;
  const { debt, today, actions } = detail;

  return (
    <div className="flex flex-col gap-3.5">
      <DetailHeader debt={debt} />
      <DetailHero debt={debt} clearBy={detail.clearBy} />
      <SegmentedControl
        aria-label="Show"
        value={tab}
        onValueChange={setTab}
        options={TABS}
        fullWidth
        className="[&>button]:h-11"
      />
      {tab === 'sooner' ? (
        <PaySooner detail={detail} />
      ) : tab === 'payments' ? (
        <DebtPayments
          debt={debt}
          today={today}
          onUndoOverpayment={(recordId, name) => void actions.undoOverpayment(recordId, name)}
        />
      ) : (
        <DebtDetails debt={debt} today={today} />
      )}
      <OverpaymentDialog debts={[debt]} onOverpay={actions.overpay} />
    </div>
  );
};

/* One debt on its own page: paying it off sooner, its payments, and its details */
export const DebtDetail = () => {
  const { id = '' } = useParams();
  const { account, loading, retry } = useAccount();

  if (account) return <DetailContent account={account} id={id} />;
  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3.5">
        <span role="status" className="sr-only">
          Loading your account
        </span>
        <Skeleton className="h-12 w-[60%]" />
        <Skeleton className="h-[220px] rounded-3xl" />
        <Skeleton className="h-11 rounded-full" />
      </div>
    );
  }
  return <AccountError onRetry={retry} />;
};
