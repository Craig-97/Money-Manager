import { ApolloCache, useMutation } from '@apollo/client';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { Fragment, useCallback, useState } from 'react';
import { CREATE_ONE_OFF_PAYMENT_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';
import { Account, AccountData, OneOffPayment } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
import { getNewOneOffPaymentAdded } from '../../utils';
import { PaymentsDuePopup } from '../Popups';
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

  const addPaymentCache = (cache: ApolloCache<any>, oneOffPayment: OneOffPayment) => {
    const data: AccountData | null = cache.readQuery({
      query: GET_ACCOUNT_QUERY
    });

    if (data) {
      cache.writeQuery({
        query: GET_ACCOUNT_QUERY,
        data: getNewOneOffPaymentAdded(data?.account, oneOffPayment)
      });
    }
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
          icon={<AccountBalanceWalletIcon color="secondary" style={{ fontSize: 50 }} />}
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
