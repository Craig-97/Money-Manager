import { ApolloError } from '@apollo/client';

const getGQLErrorExtensions = (error: ApolloError) => error?.graphQLErrors?.[0].extensions;

export const getGQLTokenExpired = (error: ApolloError) => {
  const extensions = getGQLErrorExtensions(error);

  return extensions?.expired;
};
