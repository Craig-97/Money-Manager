import { skipToken, useQuery } from '@apollo/client/react';
import { DebtHistoryDocument } from '~/graphql/generated';
import { debtHistory, DebtPayment } from '~/lib/debts';

/*
 * A debt's payments, newest first, led by the next one due. Fetched each time it's shown, as paying
 * or overpaying anywhere adds to it. Null for no debt.
 */
export const useDebtHistory = (debt: DebtPayment | null | undefined, today: Date) => {
  const { data, loading, error, refetch } = useQuery(
    DebtHistoryDocument,
    debt ? { variables: { id: debt.id }, fetchPolicy: 'cache-and-network' } : skipToken
  );
  const records = data?.recurringPayment?.history;

  return {
    entries: debt && records ? debtHistory(debt, records, today) : [],
    loading: loading && !records,
    error: error && !records ? error : undefined,
    retry: () => void refetch()
  };
};
