import { Fragment, useState } from 'react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { PaymentsDuePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useCreatePayment } from '~/hooks';
import { useAccountContext } from '~/state';
import { OneOffPayment } from '~/types';

export const PaymentsDueCard = () => {
  const { account, user } = useAccountContext();
  const { paymentsDueTotal } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { createNewPayment, loading } = useCreatePayment(() => setIsOpen(false));

  const handleCreatePayment = (oneOffPayment: OneOffPayment) => {
    createNewPayment({ oneOffPayment, user });
  };

  return (
    <Fragment>
      <TotalCard
        classBaseName="payments-due"
        title="PAYMENTS DUE"
        amount={paymentsDueTotal}
        onClick={() => setIsOpen(true)}
        icon={<AccountBalanceWalletIcon color="secondary" />}
      />
      <PaymentsDuePopup
        title="Add Upcoming Payment"
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        onSave={handleCreatePayment}
        loading={loading}
      />
    </Fragment>
  );
};
