import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { AccountProvider } from './state/account-context';
import { client } from './graphql';
import { AppRoutes } from './routes';
import { theme } from './utils';
import './scss/app.scss';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'top' }}>
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
