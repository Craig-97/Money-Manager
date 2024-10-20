import { useMutation } from '@apollo/client';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { CREATE_ONE_OFF_PAYMENT_MUTATION, addPaymentCache } from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { OneOffPayment } from '~/types';
import { PaymentsDuePopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';
import { useErrorHandler } from '~/hooks';

export const PaymentsDueCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { paymentsDueTotal } = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

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
      ) => addPaymentCache(cache, oneOffPayment, user),
      onCompleted: () => enqueueSnackbar(`${oneOffPayment.name} added`, { variant: 'success' }),
      onError: handleGQLError
    });
  };

  const handleClickOpen = () => {
    setIsOpen(true);
  };

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
        close={() => setIsOpen(false)}
        onSave={createNewOneOffPayment}
      />
    </Fragment>
  );
};
