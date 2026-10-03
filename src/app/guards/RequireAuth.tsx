import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '~/constants';
import { useAuthStore } from '~/state/auth';

/* Only for signed-in people; everyone else goes to sign in */
export const RequireAuth = () => {
  const hasSession = useAuthStore(state => state.session !== null);
  const location = useLocation();

  if (!hasSession) {
    return <Navigate to={ROUTES.signIn} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
