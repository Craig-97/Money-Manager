import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { BottomNav } from '../BottomNav';
import { Sidebar } from '../Sidebar';

interface StandardPageProps {
  children?: React.ReactNode;
  bottomNav?: boolean;
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
          id="main"
          component="main"
          sx={{
            flexGrow: 1,
            width: showSidebar ? { sm: `calc(100% - 280px)` } : '100%',
            position: 'relative',
            height: '100%',
            overflow: 'auto'
          }}>
          {children}
        </Box>
      </Box>
      {bottomNav && <BottomNav />}
    </Fragment>
  );
};
