import { ApolloClient, InMemoryCache } from '@apollo/client';

// Custom merge function for account queries
const cache = new InMemoryCache({
  typePolicies: {
    Account: {
      fields: {
        oneOffPayments: {
          merge(existing, incoming) {
            return incoming;
          }
        }
      }
    }
  }
});

const uri =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_API_URL
    : process.env.REACT_APP_DEV_API_URL;

export const client = new ApolloClient({
  uri,
  cache
});
