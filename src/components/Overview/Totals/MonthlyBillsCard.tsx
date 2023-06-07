import { useMutation } from '@apollo/client';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useSnackbar } from 'notistack';
import { Fragment, useState } from 'react';
import { CREATE_BILL_MUTATION, addBillCache } from '~/graphql';
import { useAccountContext } from '~/state/account-context';
import { Bill } from '~/types';
import { MonthlyBillsPopup } from '../Popups';
import { LoadingCard } from './LoadingCard';
import { TotalCard } from './TotalCard';

export const MonthlyBillsCard = () => {
  const {
    state: { account, user }
  } = useAccountContext();
  const { billsTotal } = account;
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
        close={() => setIsOpen(false)}
        onSave={createNewBill}
      />
    </Fragment>
  );
};
