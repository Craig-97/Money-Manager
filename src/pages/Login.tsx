import Card from '@mui/material/Card';
import { LoginPanels } from '../components/LoginRegister';

export const Login = () => (
  <div className="page">
    <main>
      <div className="login">
        <Card className="loginregister">
          <h1>Money Manager</h1>
          <LoginPanels />
        </Card>
      </div>
    </main>
  </div>
);
