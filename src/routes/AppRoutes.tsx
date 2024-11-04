import { Navigate, Route, Routes } from 'react-router-dom';
import { Loading } from '~/components';
import { Forecast, Homepage, Login, Notes, SessionExpired, Setup, Error, Bills } from '~/pages';
import { useAccountData } from '~/hooks';
import { AccountRoutes } from './AccountRoutes';
import { ProtectedRoutes } from './ProtectedRoutes';
import { PublicRoutes } from './PublicRoutes';

export const AppRoutes = () => {
  const { loading, accountExists } = useAccountData();

  if (loading) return <Loading />;

  return (
    <Routes>
      {/* Universal redirect route */}
      <Route path="*" element={<Navigate replace to="/login" />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoutes />}>
        {/* Existing Account Routes */}
        <Route path="/" element={<AccountRoutes accountExists={accountExists} />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/bills" element={<Bills />} />
        </Route>
        <Route path="/setup" element={accountExists ? <Navigate replace to="/" /> : <Setup />} />
      </Route>

      {/* Public Routes */}
      <Route path="/login" element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Error Routes */}
      <Route path="/session-expired" element={<SessionExpired />} />
      <Route path="/error" element={<Error />} />
    </Routes>
  );
};
