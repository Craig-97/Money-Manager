import { useMemo } from 'react';
import { useAccountContext } from '~/state/account-context';
import { AccountState } from '~/types';
import { getForecastDate, getNextNumberOfMonths } from '~/utils';
import { Table } from '../Table';

interface ForecastTableProps {
  past?: boolean;
}

export const ForecastTable = ({ past = false }: ForecastTableProps) => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankFreeToSpend, monthlyIncome, billsTotal }: AccountState = account;

  const columns = useMemo(
    () => [
      {
        Header: `${past ? 'Before Payday Balance' : 'Payday Balance'}`,
        columns: [
          {
            Header: 'Month',
            accessor: 'month'
          },
          {
            Header: 'Amount',
            accessor: 'amount'
          }
        ]
      }
    ],
    [past]
  );

  const months = useMemo(() => getNextNumberOfMonths(getForecastDate(new Date()), 24), []);

  const data = useMemo(() => {
    let balance = bankFreeToSpend || 0;
    const monthlySpend = billsTotal || 1250; // TODO - Configurable via user input
    const moneyLeftOver = monthlyIncome - monthlySpend;
    let newData: Array<object> = [];

    months?.forEach((month, index) => {
      if (!past && index === 0) {
        balance = balance + monthlyIncome;
      } else if (index > 0) {
        balance = balance + moneyLeftOver;
      }
      newData.push({ month, amount: `£${balance.toLocaleString()}` });
    });

    return newData;
  }, [bankFreeToSpend, monthlyIncome, billsTotal, months, past]);

  return <Table columns={columns} data={data} />;
};
