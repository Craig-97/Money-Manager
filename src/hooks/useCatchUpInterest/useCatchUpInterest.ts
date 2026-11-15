import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { CatchUpInterestDocument } from '~/graphql/generated';
import { fromApiDate, startOfToday } from '~/lib/dates';
import { useBudget } from '../useBudget';

/*
 * Savings interest is added on the day it's paid, so nobody has to. Once the budget has loaded, any
 * payment that's come since the app was last opened is added, once a visit; the API won't add one
 * twice, so another tab doing the same is fine.
 */
export const useCatchUpInterest = () => {
  const { budget } = useBudget();
  const [catchUp] = useMutation(CatchUpInterestDocument);
  const asked = useRef<string | null>(null);

  const today = startOfToday();
  const due = !!budget?.accounts.some(account => {
    const next = fromApiDate(account.interest?.nextDate);
    return !!next && next <= today;
  });
  const budgetId = budget?.id ?? null;

  useEffect(() => {
    if (!budgetId || !due || asked.current === budgetId) return;
    asked.current = budgetId;
    // Nothing to tell anyone if it fails: it's tried again on the next visit
    catchUp({ variables: { budgetId } }).catch(() => undefined);
  }, [budgetId, due, catchUp]);
};
