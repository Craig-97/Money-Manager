import { ApolloError, useApolloClient } from '@apollo/client';
import { logout } from '../../utils';
import { getGQLTokenExpired } from '../../utils/selectors/GQLErrors';

interface ErrorProps {
  error: ApolloError;
}

export const Error = ({ error }: ErrorProps) => {
  const client = useApolloClient();
  const isExpired = getGQLTokenExpired(error);

  // Expired token errors get automatically logged out
  if (isExpired) {
    logout(undefined, client);
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
