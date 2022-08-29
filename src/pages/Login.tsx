import Card from '@mui/material/Card';
import { LoginPanels } from '../components/LoginRegister';
import { StandardPage } from '../components/StandardPage';

export const Login = () => (
  <StandardPage header={false}>
    <div className="login">
      <Card className="loginregister">
        <h1>Money Manager</h1>
        <LoginPanels />
      </Card>
    </div>
  </StandardPage>
);
