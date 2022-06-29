import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/* Custom merge function for account queries */
const cache = new InMemoryCache({
  typePolicies: {
    Account: {
      fields: {
        bills: {
          merge: (old, incoming) => incoming
        },
        oneOffPayments: {
          merge: (old, incoming) => incoming
        },
        notes: {
          merge: (old, incoming) => incoming
        }
      }
    }
  }
});

const uri =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL
    : process.env.REACT_APP_DEV_API_URL;

const httpLink = createHttpLink({
  uri
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
});
