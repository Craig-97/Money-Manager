import { Navigate, Outlet } from 'react-router';
import { ROUTES } from '~/constants';
import { useAccountStatus } from '~/hooks/useAccountStatus';
import { useCurrentUser } from '~/hooks/useCurrentUser';

/*
 * Only for people who have finished setup; everyone else goes to setup. The user and account
 * requests start together here. While the account loads, or if it fails, the pages show their own
 * skeleton or error inside the app shell.
 */
export const RequireAccount = () => {
  const { status } = useAccountStatus();
  // Started alongside the account so the shell's user chip doesn't wait for it
  useCurrentUser();

  if (status === 'missing') return <Navigate to={ROUTES.setup} replace />;

  return <Outlet />;
};
