import { getForecastDate } from '../date/dates';
import { getNextNumberOfMonths } from '../date/dates';

export interface ForecastCalculationParams {
  months: string[];
  initialBalance: number;
  monthlyIncome: number;
  monthlyNet: number;
  past: boolean;
}

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

      // Calculate percentage change
      let percentageChange;
      if (index > 0) {
        const previousBalance = past
          ? initialBalance + monthlyNet * (index - 1)
          : initialBalance + monthlyIncome + monthlyNet * (index - 1);

        const change = ((balance - previousBalance) / Math.abs(previousBalance)) * 100;

        // If both numbers are negative and the balance is decreasing (getting more negative)
        if (balance < 0 && previousBalance < 0 && balance < previousBalance) {
          percentageChange = -Math.abs(change);
        } else {
          percentageChange = change;
        }
      }

      return {
        month,
        amount: `£${balance.toLocaleString()}`,
        percentageChange: percentageChange?.toFixed(1)
      };
    }) ?? []
  );
};

export interface ForecastProjections {
  oneYearProjection: number;
  monthlyGrowth: string;
  oneYearGrowth: string;
}

interface CalculateProjectionsParams {
  bankFreeToSpend: number;
  bankPaydayBalance: number;
  monthlyIncome: number;
  monthlySpend: number;
}

export const calculateProjections = ({
  bankFreeToSpend,
  monthlyIncome,
  monthlySpend
}: CalculateProjectionsParams): ForecastProjections => {
  const monthlyNet = monthlyIncome - monthlySpend;
  const oneYearProjection = bankFreeToSpend + monthlyNet * 12;
  const monthlyChange = monthlyNet / bankFreeToSpend;
  const monthlyGrowth = (monthlyChange * 100).toFixed(2);
  const oneYearGrowth = ((oneYearProjection / bankFreeToSpend - 1) * 100).toFixed(0);

  return {
    oneYearProjection,
    monthlyGrowth,
    oneYearGrowth
  };
};
