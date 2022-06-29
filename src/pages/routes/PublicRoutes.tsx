import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoutes = () => {
  const token = localStorage.getItem('token');

  return token ? <Navigate to="/" /> : <Outlet />;
};
