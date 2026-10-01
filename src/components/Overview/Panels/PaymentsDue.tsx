import { Fragment, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Typography, Divider } from '@mui/material';
import { EditMonthlyBillsPopup, EditPaymentsDuePopup } from '../Popups';
import { PAYMENT_TYPENAME, PAYMENT_TYPE } from '~/constants';
import { useAccountStore } from '~/state';
import { Bill, OneOffPayment } from '~/types';

interface Modal {
  PAYMENT_DUE: boolean;
  BILL: boolean;
}

const formatAmount = (amount: number) => {
  return Math.abs(amount).toFixed(2);
};

export const PaymentsDue = () => {
  const [isOpen, setIsOpen] = useState<Modal>({ PAYMENT_DUE: false, BILL: false });
  const [selectedPayment, setSelectedPayment] = useState<OneOffPayment | Bill>({});

  const [paymentsDue, paymentsDueTotal] = useAccountStore(
    useShallow(s => [s.account.paymentsDue, s.account.paymentsDueTotal ?? 0])
  );

  const handleClickOpen = (payment: Bill | OneOffPayment) => {
    setSelectedPayment(payment);

    setIsOpen({
      ...isOpen,
      BILL: payment.__typename === PAYMENT_TYPENAME.BILL,
      PAYMENT_DUE: payment.__typename !== PAYMENT_TYPENAME.BILL
    });
  };

  return (
    <Fragment>
      <div>
        {paymentsDue?.map(({ id, name, amount, type, __typename, ...rest }) => (
          <Fragment key={`${id}-fragment`}>
            <Box
              onClick={() => handleClickOpen({ id, name, amount, type, __typename, ...rest })}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1,
                px: 3,
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  '& .MuiTypography-root:last-child': {
                    transform: 'translateX(-4px) scale(1.05)'
                  },
                  '& .MuiTypography-root:first-of-type': {
                    transform: 'translateX(4px)'
                  }
                },
                '&:active': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiTypography-root:last-child': {
                    transform: 'translateX(-2px) scale(1.05)'
                  },
                  '& .MuiTypography-root:first-of-type': {
                    transform: 'translateX(2px)'
                  }
                }
              }}>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                {name}
              </Typography>
              <Typography
                sx={{
                  ml: 2.5,
                  color: type === PAYMENT_TYPE.EXPENSE ? 'error.main' : 'success.main',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                {type === PAYMENT_TYPE.EXPENSE ? '- ' : '+ '}£{formatAmount(amount ?? 0)}
              </Typography>
            </Box>
            <Divider />
          </Fragment>
        ))}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            px: 3
          }}>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
            Total
          </Typography>
          <Typography
            sx={{
              color: paymentsDueTotal < 0 ? 'success.main' : 'error.main',
              fontSize: '1.1rem',
              fontWeight: 600
            }}>
            {paymentsDueTotal < 0 ? '+ ' : '- '}£{formatAmount(Math.abs(paymentsDueTotal))}
          </Typography>
        </Box>
      </div>
      <EditMonthlyBillsPopup
        isOpen={isOpen.BILL}
        close={() => setIsOpen({ PAYMENT_DUE: false, BILL: false })}
        selectedBill={selectedPayment as Bill}
      />
      <EditPaymentsDuePopup
        isOpen={isOpen.PAYMENT_DUE}
        close={() => setIsOpen({ PAYMENT_DUE: false, BILL: false })}
        selectedPayment={selectedPayment as OneOffPayment}
      />
    </Fragment>
  );
};
