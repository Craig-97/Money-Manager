import { useState } from 'react';
import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { daysBetween } from '~/lib/dates';
import { summarise, toPayments } from '~/lib/payments';
import { defaultSpend, monthRows, project, spendLimit } from '../forecastModel';

export const ROWS_PER_PAGE = [6, 12, 24] as const;
export type RowsPerPage = (typeof ROWS_PER_PAGE)[number];

/* The forecast from the account: today's figures and where they're heading at a monthly spend */
export const useForecast = (account: Account) => {
  const { today, cycle, holidays } = usePayCycle(account.payday);
  const summary = summarise({
    payments: toPayments(account, today),
    bankBalance: account.bankBalance,
    monthlyIncome: account.monthlyIncome,
    cycle,
    today
  });
  const income = account.monthlyIncome;
  const recurring = summary.monthlyRecurring;

  const [spendChoice, setSpendChoice] = useState<number | null>(null);
  const [afterPayday, setAfterPayday] = useState(false);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState<RowsPerPage>(6);

  // Spending more than comes in is allowed, to see how quickly the balance runs down
  const spend = Math.max(0, spendChoice ?? defaultSpend(recurring));
  const projection = project({ start: summary.freeToSpend, income, spend, recurring });
  const rows = account.payday
    ? monthRows({
        today,
        start: summary.freeToSpend,
        net: projection.net,
        income,
        afterPayday,
        payday: account.payday,
        holidays
      })
    : [];
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const currentPage = Math.min(page, pages - 1);
  const cycleDays = Math.max(1, daysBetween(cycle.start, cycle.end));

  const inAYear = new Date(today.getFullYear() + 1, today.getMonth(), 1);

  return {
    today,
    cycle,
    bankBalance: account.bankBalance,
    // "October 2027", the month the 12-month projection reaches
    yearLabel: inAYear.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    summary,
    payday: account.payday,
    income,
    recurring,
    spend,
    spendMax: spendLimit(income, recurring, spend),
    // A new spend goes back to the first page of the table
    setSpend: (amount: number) => {
      setSpendChoice(amount);
      setPage(0);
    },
    projection,
    cycleProgress: Math.min(100, (daysBetween(cycle.start, today) / cycleDays) * 100),
    afterPayday,
    setAfterPayday,
    rows: rows.slice(currentPage * perPage, (currentPage + 1) * perPage),
    totalRows: rows.length,
    firstRow: currentPage * perPage,
    page: currentPage,
    pages,
    setPage,
    perPage,
    setPerPage: (rows: RowsPerPage) => {
      setPerPage(rows);
      setPage(0);
    }
  };
};

export type Forecast = ReturnType<typeof useForecast>;
