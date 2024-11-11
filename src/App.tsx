import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { client } from './graphql';
import { AppRoutes } from './routes';
import { UserProvider, SnackbarProvider } from './state';
import { theme } from './styles';
import './styles/app.scss';

export const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <UserProvider>
          <SnackbarProvider>
            <div className="app">
              <Router>
                <AppRoutes />
              </Router>
            </div>
          </SnackbarProvider>
        </UserProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};
