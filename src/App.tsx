import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { closeSnackbar, SnackbarProvider } from 'notistack';
import { AccountProvider } from './state/account-context';
import { Button } from '@mui/material';
import { client } from './graphql';
import { AppRoutes } from './routes';
import { theme } from './utils';
import './scss/app.scss';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <SnackbarProvider
            anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
            autoHideDuration={2500}
            action={key => (
              <Button
                onClick={() => closeSnackbar(key)}
                style={{ color: '#fff', fontSize: '20px' }}>
                ✖
              </Button>
            )}>
            <div className="app">
              <AppRoutes />
            </div>
          </SnackbarProvider>
        </AccountProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
