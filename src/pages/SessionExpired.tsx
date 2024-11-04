import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

export const SessionExpired = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '75vh',
        textAlign: 'center'
      }}>
      <Typography variant="h4" textTransform="uppercase" fontWeight="bold" sx={{ pb: 2 }}>
        Session Expired
      </Typography>
      <Typography variant="h6" textTransform="uppercase">
        Your session has expired
      </Typography>
      <Typography variant="h6" textTransform="uppercase" sx={{ pb: 3 }}>
        Please log in again
      </Typography>
      <Button onClick={() => navigate('/login')} size="large" variant="outlined">
        Go to Login
      </Button>
    </Box>
  );
};
