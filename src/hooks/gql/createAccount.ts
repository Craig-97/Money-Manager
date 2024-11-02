import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { CREATE_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useAccountContext } from '~/state';

export const useCreateAccount = () => {
  const {
    state: { user }
  } = useAccountContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleGQLError = useErrorHandler();

  const [createAccount, { loading }] = useMutation(CREATE_ACCOUNT_MUTATION, {
    onError: handleGQLError,
    onCompleted: () => {
      enqueueSnackbar('Setup completed successfully!', { variant: 'success' });
    },
    update: (
      cache,
      {
        data: {
          createAccount: { account }
        }
      }
    ) => {
      editAccountCache(cache, account, user);
      navigate('/');
    }
  });

  return { createAccount, loading };
};
