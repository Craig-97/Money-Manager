import { useState } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import { DebtHistoryDocument } from '~/graphql/generated';
import { byMonth, debtHistory, DebtPayment } from '~/lib/debts';

// The latest payments shown at first, and how many more each "Show older payments" adds
const FIRST = 12;
const MORE = 24;
// As many as the API gives at once, less the one asked for to see if there are more
const MOST = 199;

/*
 * A debt's payments, newest first and grouped by month, led by the next one due. It starts with
 * the latest few, and asks for one more than it shows so it knows whether older ones are there.
 * Fetched each time it's shown, as paying or overpaying anywhere adds to it.
 */
export const useDebtHistory = (debt: DebtPayment | null | undefined, today: Date) => {
  // Starts again from the latest few for each debt
  const [shown, setShown] = useState({ id: debt?.id, count: FIRST });
  const count = shown.id === debt?.id ? shown.count : FIRST;

  const { data, previousData, loading, error, refetch } = useQuery(
    DebtHistoryDocument,
    debt
      ? { variables: { id: debt.id, limit: count + 1 }, fetchPolicy: 'cache-and-network' }
      : skipToken
  );
  // While older ones load, the ones already showing stay
  const records = (data ?? previousData)?.recurringPayment?.history;
  const entries = debt && records ? debtHistory(debt, records.slice(0, count), today) : [];

  return {
    months: byMonth(entries),
    loading: loading && !records,
    loadingMore: loading && !!records,
    hasMore: !!records && records.length > count && count < MOST,
    showMore: () => setShown({ id: debt?.id, count: Math.min(count + MORE, MOST) }),
    error: error && !records ? error : undefined,
    retry: () => void refetch()
  };
};
