import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { client } from './graphql';
import { AppRoutes } from './routes';
import { AccountProvider, SnackbarProvider } from './state';
import { theme } from './styles';
import './styles/app.scss';

export const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <SnackbarProvider>
            <div className="app">
              <Router>
                <AppRoutes />
              </Router>
            </div>
          </SnackbarProvider>
        </AccountProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};
