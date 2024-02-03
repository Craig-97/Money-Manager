import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Error } from '~/components/ErrorMsg';
import { Loading } from '~/components/Loading';
import { Forecast, Homepage, Login, Notes, Setup } from '~/pages';
import { useAccountData } from '~/utils';
import { AccountRoutes } from './AccountRoutes';
import { ProtectedRoutes } from './ProtectedRoutes';
import { PublicRoutes } from './PublicRoutes';

export const AppRoutes = () => {
  const { loading, error, accountExists } = useAccountData();

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <Router>
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
          </Route>
          <Route path="/setup" element={accountExists ? <Navigate replace to="/" /> : <Setup />} />
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
};
