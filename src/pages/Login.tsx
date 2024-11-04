import { Box, Card, Typography } from '@mui/material';
import { LoginPanels, StandardPage } from '~/components';

export const Login = () => (
  <StandardPage bottomNav={false}>
    <Box sx={{ maxWidth: '1196px', m: '0 auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
        <Card className="loginregister">
          <Typography variant="h1" fontWeight={700}>
            Money Manager
          </Typography>
          <LoginPanels />
        </Card>
      </Box>
    </Box>
  </StandardPage>
);
