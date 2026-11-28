import { useQuery } from '@apollo/client/react';
import { BudgetDocument } from '~/graphql/generated';

/*
 * The signed-in user's budget, for pages behind RequireBudget. It shares the guard's request,
 * so this doesn't fetch again. `budget` is null while it loads or if loading failed.
 */
export const useBudget = () => {
  const { data, error, refetch } = useQuery(BudgetDocument);

  return {
    budget: data?.budget ?? null,
    loading: !data && !error,
    error,
    retry: () => void refetch()
  };
};

export type Budget = NonNullable<ReturnType<typeof useBudget>['budget']>;
