import { Box, Button, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export const Error = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || {
    name: 'An unexpected error occurred',
    message: 'Please try again later'
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        textAlign: 'center'
      }}>
      <Typography variant="h4" textTransform="uppercase" fontWeight="bold" sx={{ pb: 2 }}>
        {error?.name}
      </Typography>
      <Typography variant="h6" textTransform="uppercase" sx={{ pb: 2 }}>
        {error?.message}
      </Typography>
      <Button onClick={() => navigate('/')} size="large" variant="outlined">
        Go to Homepage
      </Button>
    </Box>
  );
};
