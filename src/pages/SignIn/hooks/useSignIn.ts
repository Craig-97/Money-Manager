import { useApolloClient, useLazyQuery } from '@apollo/client/react';
import { CurrentUserDocument, LoginDocument } from '~/graphql/generated';
import { useAuthStore } from '~/state/auth';

const HOUR_MS = 60 * 60 * 1000;

export interface SignInValues {
  email: string;
  password: string;
}

/* Signs in and starts the session. Rejects with the API's error when sign in fails. */
export const useSignIn = () => {
  const client = useApolloClient();
  const [login] = useLazyQuery(LoginDocument, { fetchPolicy: 'no-cache' });
  const startSession = useAuthStore(s => s.startSession);

  return async ({ email, password }: SignInValues) => {
    const { data } = await login({ variables: { email: email.trim(), password } });
    if (!data) throw new Error('Sign in failed. Please try again.');

    const { token, tokenExpiration, user } = data.login;

    // The login response already has the user, so the app doesn't need to ask for it again
    client.writeQuery({ query: CurrentUserDocument, data: { tokenFindUser: user } });

    startSession({ token, userId: user.id, expiresAt: Date.now() + tokenExpiration * HOUR_MS });
  };
};
