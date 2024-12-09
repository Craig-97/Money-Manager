import { SyntheticEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import Logout from '@mui/icons-material/Logout';
import NoteRounded from '@mui/icons-material/NoteRounded';
import UpdateIcon from '@mui/icons-material/Update';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { useTheme } from '@mui/material/styles';
import { useLogout } from '~/hooks';

export const BottomNav = () => {
  const theme = useTheme();
  const [value, setValue] = useState(window.location.pathname);
  const logout = useLogout();

  const onChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BottomNavigation
      className="bottom-nav"
      value={value}
      onChange={onChange}
      sx={{
        display: { mobile: 'flex', sm: 'none' },
        width: '100%',
        position: 'fixed',
        bottom: 0,
        zIndex: 100,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
      <BottomNavigationAction value={'/'} icon={<HomeIcon />} component={Link} to={'/'} />
      <BottomNavigationAction
        value={'/forecast'}
        icon={<UpdateIcon />}
        component={Link}
        to={'/forecast'}
      />
      <BottomNavigationAction
        value={'/notes'}
        icon={<NoteRounded />}
        component={Link}
        to={'/notes'}
      />
      <BottomNavigationAction value={'/logout'} icon={<Logout />} onClick={() => logout()} />
    </BottomNavigation>
  );
};
