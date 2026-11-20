import { useState } from 'react';
import { skipToken, useApolloClient, useQuery } from '@apollo/client/react';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { showErrorToast } from '~/state/toast';

interface YearOfHistory<T> {
  historyYears: number[];
  history: T[];
}

interface Options<Q, T> {
  // The payment or account whose history it is
  id: string | undefined;
  today: Date;
  // Its history and years, out of the query's result
  select: (data: Q) => YearOfHistory<T> | null | undefined;
}

/*
 * A payment's or an account's history, a year at a time. On desktop one year shows and the years
 * page back and forth; on a phone older years are added below the newest, one each time it asks.
 * The year showing is fetched each time it's shown, as paying anywhere adds to it; older ones are
 * read once. Each payment or account starts again from this year.
 */
export const useHistoryByYear = <Q, T>(
  query: TypedDocumentNode<Q, { id: string; year: number }>,
  { id, today, select }: Options<Q, T>
) => {
  const client = useApolloClient();
  const thisYear = today.getFullYear();
  const fresh = { id, year: thisYear, older: [] as { year: number; records: T[] }[] };
  const [state, setState] = useState(fresh);
  const current = state.id === id ? state : fresh;
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, refetch } = useQuery(
    query,
    id ? { variables: { id, year: current.year }, fetchPolicy: 'cache-and-network' } : skipToken
  );
  const shown = data ? select(data) : null;
  // This year always has a page, for what's due next, even before anything's happened
  const years = [...new Set([...(shown?.historyYears ?? []), thisYear])].sort((a, b) => b - a);
  const lastShown = current.older.at(-1)?.year ?? current.year;
  const nextOlder = years.find(year => year < lastShown);

  return {
    year: current.year,
    years,
    // The year showing, newest first; undefined while it loads
    records: shown?.history,
    // Older years added below it on a phone, newest first
    older: current.older,
    loading: loading && !shown,
    error: error && !shown ? error : undefined,
    retry: () => void refetch(),
    showYear: (year: number) => setState({ ...current, year, older: [] }),
    hasOlder: nextOlder !== undefined,
    loadingMore,
    showOlder: async () => {
      if (!id || nextOlder === undefined) return;
      setLoadingMore(true);
      try {
        const result = await client.query({ query, variables: { id, year: nextOlder } });
        const records = result.data ? (select(result.data)?.history ?? []) : [];
        setState({ ...current, older: [...current.older, { year: nextOlder, records }] });
      } catch (failure) {
        showErrorToast(failure, { fallback: 'Couldn’t load any more. Try again.' });
      } finally {
        setLoadingMore(false);
      }
    }
  };
};
