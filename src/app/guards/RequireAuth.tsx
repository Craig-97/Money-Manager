import { Navigate, Outlet, useLocation } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { ROUTES } from '~/constants';
import { useAuthStore } from '~/state/auth';

/* Only for signed-in people; everyone else goes to sign in */
export const RequireAuth = () => {
  const hasSession = useAuthStore(s => s.session !== null);
  const restored = useAuthStore(s => s.restored);
  const location = useLocation();

  // Whether there's a session isn't known until the refresh cookie has been tried
  if (!restored) return <FullPageLoader />;

  if (!hasSession) {
    return <Navigate to={ROUTES.signIn} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
