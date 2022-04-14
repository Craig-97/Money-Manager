import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Error } from '../components/ErrorMsg';
import { Loading } from '../components/Loading';
import { useAccountData } from '../utils';
import { Forecast } from './Forecast';
import { Homepage } from './Homepage';
import { Notes } from './Notes';

export const AppRoutes = () => {
  const { loading, error } = useAccountData();

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </Router>
  );
};
