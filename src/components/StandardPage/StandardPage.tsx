import { Box } from '@mui/material';
import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { BottomNav } from '../BottomNav';

interface StandardPageProps {
  children?: React.ReactNode;
  bottomNav?: Boolean;
}

const PUBLIC_ROUTES = ['/login', '/setup', '/session-expired'];

export const StandardPage = ({ children, bottomNav = true }: StandardPageProps) => {
  const { pathname } = useLocation();
  const showSidebar = !PUBLIC_ROUTES.includes(pathname);

  return (
    <Fragment>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {showSidebar && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: showSidebar ? { sm: `calc(100% - 280px)` } : '100%'
          }}>
          {children}
        </Box>
      </Box>
      {bottomNav && <BottomNav />}
    </Fragment>
  );
};
