import { Navigate, Outlet } from 'react-router';
import { skipToken, useQuery } from '@apollo/client/react';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { BudgetDocument } from '~/graphql/generated';
import { useBudgetStatus } from '~/hooks/useBudgetStatus';
import { BudgetLoadError } from './BudgetLoadError';

/*
 * Only for people who have finished setup; everyone else goes to setup. The budget starts loading
 * here, alongside the page's code. While it loads, or if it fails, the pages show their own
 * skeleton or error inside the app shell.
 */
export const RequireBudget = () => {
  const { status, retry } = useBudgetStatus();
  useQuery(BudgetDocument, status === 'ready' ? {} : skipToken);

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'error') return <BudgetLoadError onRetry={retry} />;
  if (status === 'missing') return <Navigate to={ROUTES.setup} replace />;

  return <Outlet />;
};
