import { Navigate, Outlet } from 'react-router';
import { skipToken, useQuery } from '@apollo/client/react';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { AccountDocument } from '~/graphql/generated';
import { useAccountStatus } from '~/hooks/useAccountStatus';
import { AccountLoadError } from './AccountLoadError';

/*
 * Only for people who have finished setup; everyone else goes to setup. The account starts loading
 * here, alongside the page's code. While it loads, or if it fails, the pages show their own
 * skeleton or error inside the app shell.
 */
export const RequireAccount = () => {
  const { status, retry } = useAccountStatus();
  useQuery(AccountDocument, status === 'ready' ? {} : skipToken);

  if (status === 'loading') return <FullPageLoader />;
  if (status === 'error') return <AccountLoadError onRetry={retry} />;
  if (status === 'missing') return <Navigate to={ROUTES.setup} replace />;

  return <Outlet />;
};
