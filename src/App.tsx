import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { AccountProvider } from './state/account-context';
import { client } from './graphql';
import { AppRoutes } from './pages';
import { theme } from './utils';
import './scss/app.scss';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <div className="app">
            <AppRoutes />
          </div>
        </AccountProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
