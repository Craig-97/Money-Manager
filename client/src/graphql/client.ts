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

export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache
});
