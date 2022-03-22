import { useMutation } from '@apollo/client';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { Fragment, useCallback, useState } from 'react';
import { addBillCache, CREATE_BILL_MUTATION } from '../../../graphql';
import { Account, Bill } from '../../../interfaces';
import { useAccountContext } from '../../../state/account-context';
import { MonthlyBillsPopup } from '../../Popups';
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
          icon={<ReceiptIcon color="secondary" />}
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
