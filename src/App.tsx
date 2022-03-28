import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { Homepage } from './components/Homepage';
import { client } from './graphql';
import { AccountProvider } from './state/account-context';
import { theme } from './utils';
import './scss/app.scss';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <div className="app">
            <Homepage />
          </div>
        </AccountProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
