import { Homepage } from './components/Homepage';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { AccountProvider } from './state/account-context';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import './App.scss';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider
        theme={createMuiTheme({
          palette: {
            type: 'dark'
          }
        })}
      >
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
