import { Box } from '@mui/material';
import { Table } from '../Table';
import { useAccountContext } from '~/state';
import { AccountState } from '~/types';
import { getTableColumns, getMonthsList, calculateForecastData } from '~/utils';

interface ForecastTableProps {
  past?: boolean;
}

export const ForecastTable = ({ past = false }: ForecastTableProps) => {
  const { account } = useAccountContext();
  const { bankFreeToSpend, monthlyIncome, billsTotal }: AccountState = account;
  const initialBalance = bankFreeToSpend ?? 0;
  const monthlySpend = billsTotal ?? 1250;
  const monthlyNet = monthlyIncome - monthlySpend;

  const columns = getTableColumns(past);
  const months = getMonthsList();
  const data = calculateForecastData({
    months,
    initialBalance,
    monthlyIncome,
    monthlyNet,
    past
  });

  return (
    <Box
      className="forecast-table"
      sx={{
        display: 'flex',
        borderRadius: 1,
        flex: 1,
        maxWidth: { mobile: 'calc(100svw - 48px)', sm: '50%' },
        minWidth: { mobile: 'calc(100svw - 48px)', sm: '25%' },

        '& .MuiPaper-root': {
          '@media (max-width: 600px)': {
            maxHeight: 657,
            overflowY: 'auto'
          },
          '@media (max-width: 480px)': {
            minWidth: 'unset'
          }
        }
      }}>
      <Table columns={columns} data={data} />
    </Box>
  );
};
