import { useSearchParams } from 'react-router';
import { skipToken, useQuery } from '@apollo/client/react';
import { PasswordResetTokenValidDocument } from '~/graphql/generated';

export type ResetTokenStatus = 'checking' | 'valid' | 'invalid';

/*
 * The token from the emailed link (?token=) and whether it can still be used. If the check itself
 * fails the link is treated as usable: submitting the new password gives the real answer.
 */
export const useResetToken = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { data, loading } = useQuery(
    PasswordResetTokenValidDocument,
    token ? { variables: { token }, fetchPolicy: 'network-only' } : skipToken
  );

  let status: ResetTokenStatus = 'valid';
  if (!token || data?.passwordResetTokenValid === false) status = 'invalid';
  else if (loading) status = 'checking';

  return { token, status };
};
