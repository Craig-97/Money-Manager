import { Navigate, Outlet } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { useAccountStatus } from '~/hooks/useAccountStatus';
import { AccountLoadError } from './AccountLoadError';

/* Only for people who haven't finished setup yet */
export const RequireNoAccount = () => {
  const { status, refetch } = useAccountStatus();

  if (status === 'ready') return <Navigate to={ROUTES.dashboard} replace />;
  if (status === 'error') return <AccountLoadError onRetry={() => void refetch()} />;
  if (status === 'loading') return <FullPageLoader />;

  return <Outlet />;
};
