import { Fragment, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Box, Divider, Typography } from '@mui/material';
import { EditMonthlyBillsPopup } from '../Popups';
import { useAccountStore } from '~/state';
import { Bill } from '~/types';
import { formatAmount } from '~/utils';

export const MonthlyBills = () => {
  const [bills, billsTotal] = useAccountStore(
    useShallow(s => [s.account.bills, s.account.billsTotal])
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedBill, setSelectedBill] = useState<Bill>({});

  const handleClickOpen = (bill: Bill) => {
    setSelectedBill(bill);
    setIsOpen(true);
  };

  return (
    <Fragment>
      <div>
        {bills?.map(({ id, name, amount, paid }: Bill) => (
          <Fragment key={`${id}-fragment`}>
            <Box
              onClick={() => handleClickOpen({ id, name, amount, paid })}
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
                  color: 'error.main',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                - £{formatAmount(amount ?? 0)}
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
              color: 'error.main',
              fontSize: '1.1rem',
              fontWeight: 600
            }}>
            - £{formatAmount(Math.abs(billsTotal ?? 0))}
          </Typography>
        </Box>
      </div>
      <EditMonthlyBillsPopup
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        selectedBill={selectedBill}
      />
    </Fragment>
  );
};
