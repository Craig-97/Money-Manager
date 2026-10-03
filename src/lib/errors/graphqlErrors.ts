import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorCode } from '~/constants';

/* The API's error code from the first GraphQL error, e.g. ACCOUNT_NOT_LINKED */
export const getErrorCode = (error: unknown): ErrorCode | undefined => {
  if (!CombinedGraphQLErrors.is(error)) return undefined;
  return error.errors[0]?.extensions?.code as ErrorCode | undefined;
};

export const hasErrorCode = (error: unknown, code: ErrorCode) => getErrorCode(error) === code;

/* The API marks an UNAUTHENTICATED error as `expired` or `invalid` */
export const isSessionError = (error: unknown) => {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some(e => e.extensions?.code === 'UNAUTHENTICATED');
};

/* The message to show for an error, without Apollo's prefixes */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (CombinedGraphQLErrors.is(error)) return error.errors[0]?.message ?? fallback;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
