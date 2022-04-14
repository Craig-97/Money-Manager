import { ApolloError } from '@apollo/client';

interface ErrorProps {
  error: ApolloError;
}

export const Error = ({ error }: ErrorProps) => (
  <div className="app-error">
    <div className="app-error__message">
      <p>{error.name}</p>
      <p>{error.message}</p>
    </div>
  </div>
);
