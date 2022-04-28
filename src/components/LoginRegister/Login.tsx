import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export const Login = () => {
  const onLogin = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    // MAKE GQL CALL TO LOGIN QUERY AND THEN SET TOKEN RESPONSE IN LOCALSTORAGE
    // THEN REDIRECT REACT ROUTER DOM TO HOMEPAGE
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
