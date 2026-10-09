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

/*
 * The API's message for a GraphQL error. Anything else, such as no connection, gets the fallback
 * rather than the browser's technical message.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Couldn't reach Money Manager. Check your connection and try again."
) => (CombinedGraphQLErrors.is(error) ? (error.errors[0]?.message ?? fallback) : fallback);
