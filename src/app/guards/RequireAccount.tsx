import { Navigate, Outlet } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { useAccountStatus } from '~/hooks/useAccountStatus';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { AccountLoadError } from './AccountLoadError';

/*
 * Only for people who have finished setup; everyone else goes to setup. The user and account
 * requests are started together here so the app shell has both before it shows.
 */
export const RequireAccount = () => {
  const account = useAccountStatus();
  const user = useCurrentUser();

  if (account.status === 'missing') return <Navigate to={ROUTES.setup} replace />;

  if (account.status === 'error' || user.error) {
    const retry = () => {
      void account.refetch();
      void user.refetch();
    };
    return <AccountLoadError onRetry={retry} />;
  }

  if (account.status === 'loading' || user.loading) return <FullPageLoader />;

  return <Outlet />;
};
