import { useMutation } from '@apollo/client';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Fragment, useCallback, useState } from 'react';
import { addBillCache, CREATE_BILL_MUTATION } from '~/graphql';
import { Account, Bill } from '~/types';
import { useAccountContext } from '~/state/account-context';
import { MonthlyBillsPopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';
import { useSnackbar } from 'notistack';

export const MonthlyBillsCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { billsTotal }: Account = account;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

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
      ) => addBillCache(cache, bill, user),
      onError: err => enqueueSnackbar(err?.message, { variant: 'error' })
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
