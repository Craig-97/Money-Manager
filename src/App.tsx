import CloseIcon from '@mui/icons-material/Close';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { closeSnackbar, SnackbarProvider } from 'notistack';
import { BrowserRouter as Router } from 'react-router-dom';
import { AccountProvider } from './state/account-context';
import { IconButton } from '@mui/material';
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

export default App;
