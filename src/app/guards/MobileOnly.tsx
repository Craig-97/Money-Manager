import { Navigate, Outlet } from 'react-router';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';

/*
 * Pages that only exist in the mobile layout, where desktop does the same from a dialog. On desktop,
 * or once the window widens to it, they go back to the page they came from.
 */
export const MobileOnly = ({ fallback }: { fallback: string }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);

  return isDesktop ? <Navigate to={fallback} replace /> : <Outlet />;
};
