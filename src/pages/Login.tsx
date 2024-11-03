import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import { LoginPanels, StandardPage } from '~/components';

export const Login = () => (
  <StandardPage bottomNav={false}>
    <Box sx={{ maxWidth: '1196px', m: '0 auto' }}>
      <div className="login">
        <Card className="loginregister">
          <h1>Money Manager</h1>
          <LoginPanels />
        </Card>
      </div>
    </Box>
  </StandardPage>
);
