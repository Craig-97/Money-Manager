import { Box, Card, Typography } from '@mui/material';
import { SetupForm, StandardPage } from '~/components';

export const Setup = () => (
  <StandardPage bottomNav={false}>
    <Box
      sx={{
        maxWidth: '1196px',
        minHeight: `calc(100svh - 64px)`,
        m: '0 auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: 600
        }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            Welcome to <strong>Money Manager</strong>
          </Typography>
          <Typography variant="body1" component="p" align="center" color="text.secondary">
            Let's get your account set up in just a few steps.
          </Typography>

          <SetupForm />
        </Card>
      </Box>
    </Box>
  </StandardPage>
);
