import { Fragment } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Error } from '../components/ErrorMsg';
import { Loading } from '../components/Loading';
import { useAccountData } from '../utils';
import { Forecast } from './Forecast';
import { Homepage } from './Homepage';
import { Login } from './Login';
import { Notes } from './Notes';

export const AppRoutes = () => {
  const { token, loading, error, noAccount } = useAccountData();

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
        {token && (
          <Fragment>
            {noAccount && <Route path="/" element={<div>SETUP ACCOUNT PAGE</div>} />}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Homepage />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/notes" element={<Notes />} />
          </Fragment>
        )}
        {!token && <Route path="/login" element={<Login />} />}
      </Routes>
    </Router>
  );
};
