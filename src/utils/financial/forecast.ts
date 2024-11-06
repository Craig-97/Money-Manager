import { getForecastDate } from '../date/dates';
import { getNextNumberOfMonths } from '../date/dates';

export interface ForecastCalculationParams {
  months: string[];
  initialBalance: number;
  monthlyIncome: number;
  monthlyNet: number;
  past: boolean;
}

export const getTableColumns = (past: boolean) => [
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
];

export const getMonthsList = () => getNextNumberOfMonths(getForecastDate(new Date()), 24);

export const calculateForecastData = ({
  months,
  initialBalance,
  monthlyIncome,
  monthlyNet,
  past
}: ForecastCalculationParams) => {
  return (
    months?.map((month, index) => {
      let balance;
      if (past) {
        // Before Payday: Show running balance before monthly income
        balance = initialBalance + monthlyNet * index;
      } else {
        // Payday Balance: Show balance after receiving monthly income
        balance = initialBalance + monthlyIncome + monthlyNet * index;
      }

      return {
        month,
        amount: `£${balance.toLocaleString()}`
      };
    }) ?? []
  );
};
