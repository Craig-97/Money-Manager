import { useLazyQuery } from '@apollo/client/react';
import { LoginDocument } from '~/graphql/generated';
import { useStartSession } from '~/hooks/useStartSession';

export interface SignInValues {
  email: string;
  password: string;
}

/* Signs in and starts the session. Rejects with the API's error when sign in fails. */
export const useSignIn = () => {
  const [login] = useLazyQuery(LoginDocument, { fetchPolicy: 'no-cache' });
  const startSession = useStartSession();

  return async ({ email, password }: SignInValues) => {
    const { data } = await login({ variables: { email, password } });
    if (!data) throw new Error('Sign in failed. Please try again.');

    startSession(data.login);
  };
};
