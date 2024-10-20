import Card from '@mui/material/Card';
import { LoginPanels, StandardPage } from '~/components';

export const Login = () => (
  <StandardPage header={false} bottomNav={false}>
    <div className="login">
      <Card className="loginregister">
        <h1>Money Manager</h1>
        <LoginPanels />
      </Card>
    </div>
  </StandardPage>
);
