import { useLazyQuery } from '@apollo/client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import { EVENTS } from '../../constants';
import { LOGIN_QUERY } from '../../graphql';
import { useAccountContext } from '../../state';
import { LoginData } from '../../types';

export const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useAccountContext();
  const [loginQuery] = useLazyQuery<LoginData>(LOGIN_QUERY, {
    onCompleted: data => onLoginCompleted(data)
  });

  const onLoginCompleted = (response: LoginData) => {
    const {
      login: { userId, token }
    } = response;

    if (userId && token) {
      localStorage.setItem('token', token);

      dispatch({ type: EVENTS.LOGIN, data: { id: userId } });
      navigate('/');
    }
  };

  const onLogin = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    loginQuery({ variables: { ...formProps } });
  };

  return (
    <form onSubmit={onLogin}>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
      />
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
      />
      <Button type="submit" fullWidth variant="contained" color="primary">
        Sign In
      </Button>
    </form>
  );
};
