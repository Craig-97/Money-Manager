import { closeSnackbar, SnackbarProvider } from 'notistack';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { client } from './graphql';
import { AppRoutes } from './routes';
import { AccountProvider } from './state';
import { theme } from './styles';
import './styles/app.scss';

export const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <SnackbarProvider
            classes={{ containerRoot: 'notistack-container' }}
            anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
            autoHideDuration={2500}
            action={key => (
              <IconButton onClick={() => closeSnackbar(key)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}>
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
