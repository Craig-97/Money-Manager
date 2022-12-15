import { useMemo } from 'react';
import { Account } from '~/types';
import { useAccountContext } from '~/state/account-context';
import { getForecastDate, getNextNumberOfMonths } from '~/utils';
import { Table } from '../Table';

interface ForecastTableProps {
  past?: boolean;
}

export const ForecastTable = ({ past = false }: ForecastTableProps) => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankFreeToSpend, monthlyIncome }: Account = account;

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
    const monthlySpend = 1000;
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
  }, [bankFreeToSpend, monthlyIncome, months, past]);

  return <Table columns={columns} data={data} />;
};
