import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useApolloClient, useMutation } from '@apollo/client';
import { CREATE_ACCOUNT_MUTATION, GET_ACCOUNT_QUERY } from '~/graphql';
import { useErrorHandler } from '~/hooks';

export const useCreateAccount = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleGQLError = useErrorHandler();
  const client = useApolloClient();

  const [createAccount, { loading }] = useMutation(CREATE_ACCOUNT_MUTATION, {
    onError: handleGQLError,
    onCompleted: async () => {
      enqueueSnackbar('Setup completed successfully!', { variant: 'success' });
      await client.refetchQueries({
        include: [GET_ACCOUNT_QUERY]
      });
      navigate('/');
    }
  });

  return { createAccount, loading };
};
