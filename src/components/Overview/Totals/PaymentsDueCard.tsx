import { Fragment, useState } from 'react';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import { PaymentsDuePopup } from '../Popups';
import { TotalCard } from './TotalCard';
import { useCreatePayment } from '~/hooks';
import { useAccountStore, useUserContext } from '~/state';
import { OneOffPayment } from '~/types';

export const PaymentsDueCard = () => {
  const { user } = useUserContext();
  const paymentsDueTotal = useAccountStore(s => s.account.paymentsDueTotal ?? 0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { createNewPayment, loading } = useCreatePayment(() => setIsOpen(false));

  const handleCreatePayment = (oneOffPayment: OneOffPayment) => {
    createNewPayment({ oneOffPayment, user });
  };

  return (
    <Fragment>
      <TotalCard
        title="PAYMENTS DUE"
        amount={paymentsDueTotal}
        onClick={() => setIsOpen(true)}
        icon={<PaymentOutlinedIcon />}
        iconColor="secondary"
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
