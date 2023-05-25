import { ApolloError, useApolloClient } from '@apollo/client';
import { useAccountContext } from '~/state';
import { logout } from '~/utils';
import { getGQLTokenExpired } from '~/utils';
import { Loading } from '../Loading';

interface ErrorProps {
  error: ApolloError;
}

export const Error = ({ error }: ErrorProps) => {
  const client = useApolloClient();
  const isExpired = getGQLTokenExpired(error);
  const { dispatch } = useAccountContext();

  // Expired token errors get automatically logged out
  if (isExpired) {
    logout(undefined, client, dispatch);
    return <Loading />;
  }

  return (
    <div className="app-error">
      <div className="app-error__message">
        <p>{error?.name}</p>
        <p>{error?.message}</p>
      </div>
    </div>
  );
};
