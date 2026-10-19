import { useCurrentUser } from '../useCurrentUser';

type BudgetStatus = 'loading' | 'ready' | 'missing' | 'error';

/*
 * Whether the signed-in user has a budget yet, i.e. has finished setup. Every session starts with
 * the user in the cache, so this is known straight away rather than waiting on the budget.
 */
export const useBudgetStatus = () => {
  const { user, error, refetch } = useCurrentUser();

  const getStatus = (): BudgetStatus => {
    if (user) return user.budget ? 'ready' : 'missing';
    return error ? 'error' : 'loading';
  };

  return { status: getStatus(), retry: () => void refetch() };
};
