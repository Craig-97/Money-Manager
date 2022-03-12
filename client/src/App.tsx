import { ApolloProvider } from '@apollo/client/react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Homepage } from './components/Homepage';
import { client } from './graphql';
import { AccountProvider } from './state/account-context';
import './App.scss';

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
