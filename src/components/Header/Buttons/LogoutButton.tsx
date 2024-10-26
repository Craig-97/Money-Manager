import Logout from '@mui/icons-material/Logout';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useLogout } from '~/hooks';

export const LogoutButton = () => {
  const logout = useLogout();

  return (
    <Tooltip title="Logout">
      <IconButton className="logout-button" onClick={() => logout()}>
        <Logout />
      </IconButton>
    </Tooltip>
  );
};
