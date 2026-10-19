import { Navigate, Outlet } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { useBudgetStatus } from '~/hooks/useBudgetStatus';
import { BudgetLoadError } from './BudgetLoadError';

/* Only for people who haven't finished setup yet */
export const RequireNoBudget = () => {
  const { status, retry } = useBudgetStatus();

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'error') return <BudgetLoadError onRetry={retry} />;
  if (status === 'ready') return <Navigate to={ROUTES.dashboard} replace />;

  return <Outlet />;
};
