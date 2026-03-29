import { CombinedGraphQLErrors } from '@apollo/client';
import { ERRORS } from '~/constants';

export const getGQLErrorCode = (error: unknown): keyof typeof ERRORS | '' => {
  if (CombinedGraphQLErrors.is(error)) {
    return (error.errors[0].extensions?.code as keyof typeof ERRORS) ?? '';
  }
  return '';
};

export const getGQLTokenExpired = (error: unknown): boolean | undefined => {
  if (CombinedGraphQLErrors.is(error)) {
    return Boolean(error.errors[0].extensions?.expired);
  }
  return undefined;
};
