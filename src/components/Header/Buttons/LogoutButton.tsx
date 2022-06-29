import Logout from '@mui/icons-material/Logout';
import { useApolloClient } from '@apollo/client';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../utils';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  return (
    <Tooltip title="Logout">
      <IconButton className="logout-button" onClick={() => logout(navigate, client)}>
        <Logout />
      </IconButton>
    </Tooltip>
  );
};
