import { useApolloClient } from '@apollo/client';
import HomeIcon from '@mui/icons-material/Home';
import Logout from '@mui/icons-material/Logout';
import NoteRounded from '@mui/icons-material/NoteRounded';
import UpdateIcon from '@mui/icons-material/Update';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import { SyntheticEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccountContext } from '~/state';
import { logout } from '~/utils';

export const BottomNav = () => {
  const client = useApolloClient();
  const { dispatch } = useAccountContext();
  const [value, setValue] = useState(window.location.pathname);

  const onChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <BottomNavigation className="bottom-nav" value={value} onChange={onChange}>
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

      <BottomNavigationAction
        value={'/logout'}
        icon={<Logout />}
        onClick={() => logout(undefined, client, dispatch)}
      />
    </BottomNavigation>
  );
};
