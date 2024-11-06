import { ApolloError } from '@apollo/client';
import { ERRORS } from '~/constants';

const getGQLErrorExtensions = (error: ApolloError) => error?.graphQLErrors?.[0]?.extensions;

export const getGQLErrorCode = (error?: ApolloError) =>
  (error && (getGQLErrorExtensions(error)?.code as keyof typeof ERRORS)) || '';

export const getGQLTokenExpired = (error: ApolloError) => {
  const extensions = getGQLErrorExtensions(error);
  return extensions?.expired;
};
