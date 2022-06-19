import Logout from '@mui/icons-material/Logout';
import { useApolloClient } from '@apollo/client';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    client.clearStore();
  };

  return (
    <Tooltip title="Logout">
      <IconButton onClick={logout}>
        <Logout />
      </IconButton>
    </Tooltip>
  );
};
