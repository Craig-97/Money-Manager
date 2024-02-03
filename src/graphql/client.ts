import { onError } from '@apollo/link-error';
import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/* Custom merge function for account queries */
const cache = new InMemoryCache({
  typePolicies: {
    Account: {
      fields: {
        bills: {
          merge: (_old, incoming) => incoming
        },
        oneOffPayments: {
          merge: (_old, incoming) => incoming
        },
        notes: {
          merge: (_old, incoming) => incoming
        }
      }
    }
  }
});

/* Setting API URL depending on environment */
const uri =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL
    : process.env.REACT_APP_DEV_API_URL;

const httpLink = createHttpLink({
  uri
});

/* Authorization token automatically added to every GQL request if found in local storage */
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

/* Log any problem and error responses coming from the backend */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Locations:[{Line: ${locations?.[0].line}, Column: ${locations?.[0].column}}], Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

export const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache
});
