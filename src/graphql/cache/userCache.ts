import { ApolloCache } from '@apollo/client';
import { BudgetDocument, BudgetFieldsFragment } from '~/graphql/generated';

/*
 * Links a new budget to the signed-in user, which takes them out of setup: the route guards read
 * the user's budget. The budget is stored as their default one too, so the dashboard opens with
 * it already loaded.
 */
export const linkBudget = (
  cache: ApolloCache,
  { userId, budget }: { userId: string; budget: BudgetFieldsFragment }
) => {
  cache.writeQuery({ query: BudgetDocument, data: { budget } });
  cache.modify({
    id: cache.identify({ __typename: 'User', id: userId }),
    fields: { budget: () => budget.id }
  });
};
