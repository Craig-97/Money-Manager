import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Error } from '../components/ErrorMsg';
import { Loading } from '../components/Loading';
import { useAccountData } from '../utils';
import { Forecast } from './Forecast';
import { Homepage } from './Homepage';
import { Login } from './Login';
import { Notes } from './Notes';
import { AccountRoutes, ProtectedRoutes, PublicRoutes } from './routes';

export const AppRoutes = () => {
  const { loading, error, accountExists } = useAccountData();

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <Router>
      <Routes>
        {/* Universal redirect route */}
        <Route path="*" element={<Navigate replace to="/login" />} />

        {/** Protected Routes */}
        <Route path="/" element={<ProtectedRoutes />}>
          {/* Existing Account Routes*/}
          <Route path="/" element={<AccountRoutes accountExists={accountExists} />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/notes" element={<Notes />} />
          </Route>

          <Route path="/setup" element={<div>SETUP ACCOUNT PAGE</div>} />
        </Route>

        {/** Public Routes */}
        <Route path="/login" element={<PublicRoutes />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
};
