import { Box, Card, Typography } from '@mui/material';
import { SetupForm } from '~/components';

export const Setup = () => (
  <Box sx={{ minHeight: `calc(100svh - 64px)`, display: 'flex', alignItems: 'center', my: 4 }}>
    <Box sx={{ maxWidth: 600, width: '100%', px: 2 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Welcome to <strong>Money Manager</strong>
        </Typography>
        <Typography variant="body1" paragraph align="center" color="text.secondary">
          Let's get your account set up in just a few steps.
        </Typography>

        <SetupForm />
      </Card>
    </Box>
  </Box>
);
