import { ApolloCache, useMutation } from '@apollo/client';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { Fragment, useCallback, useState } from 'react';
import { CREATE_BILL_MUTATION, GET_ACCOUNT_QUERY } from '../../graphql';
import { Account, AccountData, Bill } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
import { getNewBillAdded } from '../../utils';
import { MonthlyBillsPopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const MonthlyBillsCard = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { billsTotal }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [createBill, { loading }] = useMutation(CREATE_BILL_MUTATION);

  const createNewBill = (bill: Bill) => {
    createBill({
      variables: { bill },
      update: (
        cache,
        {
          data: {
            createBill: { bill }
          }
        }
      ) => addBillCache(cache, bill)
    });
  };

  const addBillCache = (cache: ApolloCache<any>, bill: Bill) => {
    const data: AccountData | null = cache.readQuery({
      query: GET_ACCOUNT_QUERY
    });

    if (data) {
      cache.writeQuery({
        query: GET_ACCOUNT_QUERY,
        data: getNewBillAdded(data?.account, bill)
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
          classBaseName="monthly-bills"
          title={'MONTHLY BILLS'}
          amount={billsTotal}
          onClick={handleClickOpen}
          icon={<ReceiptIcon color="secondary" style={{ fontSize: 50 }} />}
        />
      ) : (
        <LoadingCard />
      )}
      <MonthlyBillsPopup
        title="Add Monthly Bill"
        isOpen={isOpen}
        close={closePopup}
        onSave={createNewBill}
      />
    </Fragment>
  );
};
