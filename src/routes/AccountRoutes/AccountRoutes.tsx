import { Navigate, Outlet } from 'react-router-dom';

interface AccountRoutesProps {
  accountExists: boolean;
}

export const AccountRoutes = ({ accountExists }: AccountRoutesProps) => {
  return !accountExists ? <Navigate to="/setup" /> : <Outlet />;
};
