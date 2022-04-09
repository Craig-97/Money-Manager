import { useMutation } from '@apollo/client';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Fragment, useCallback, useState } from 'react';
import { addPaymentCache, CREATE_ONE_OFF_PAYMENT_MUTATION } from '../../../graphql';
import { Account, OneOffPayment } from '../../../types';
import { useAccountContext } from '../../../state/account-context';
import { PaymentsDuePopup } from '../../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const PaymentsDueCard = () => {
  const {
    state: { account }
  } = useAccountContext();

  const { paymentsDueTotal }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [createOneOffPayment, { loading }] = useMutation(CREATE_ONE_OFF_PAYMENT_MUTATION);

  const createNewOneOffPayment = (oneOffPayment: OneOffPayment) => {
    createOneOffPayment({
      variables: { oneOffPayment },
      update: (
        cache,
        {
          data: {
            createOneOffPayment: { oneOffPayment }
          }
        }
      ) => addPaymentCache(cache, oneOffPayment)
    });
  };

  const handleClickOpen = () => {
    setIsOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Fragment>
      {!loading ? (
        <TotalCard
          classBaseName="payments-due"
          title={'PAYMENTS DUE'}
          amount={paymentsDueTotal}
          onClick={handleClickOpen}
          icon={<AccountBalanceWalletIcon color="secondary" />}
        />
      ) : (
        <LoadingCard />
      )}
      <PaymentsDuePopup
        title="Add Upcoming Payment"
        isOpen={isOpen}
        close={closePopup}
        onSave={createNewOneOffPayment}
      />
    </Fragment>
  );
};
