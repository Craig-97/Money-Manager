import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '~/constants';
import { useAuthStore } from '~/state/auth';

/* Only for signed-out people; signing in returns you to where you were heading */
export const PublicOnly = () => {
  const hasSession = useAuthStore(state => state.session !== null);
  const location = useLocation();

  if (hasSession) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? ROUTES.dashboard} replace />;
  }

  return <Outlet />;
};
