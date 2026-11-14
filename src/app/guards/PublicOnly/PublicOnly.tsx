import { Navigate, Outlet, useLocation } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { useAuthStore } from '~/state/auth';

/* Only for signed-out people; signing in returns you to where you were heading */
export const PublicOnly = () => {
  const hasSession = useAuthStore(s => s.session !== null);
  const restored = useAuthStore(s => s.restored);
  const location = useLocation();

  if (!restored) return <FullPageLoader />;

  if (hasSession) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? ROUTES.dashboard} replace />;
  }

  return <Outlet />;
};
