import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useAccountContext } from '~/state';

interface EditAccountInput {
  bankBalance?: number;
  monthlyIncome?: number;
}

export const useEditAccount = () => {
  const { account, user } = useAccountContext();
  const { id } = account;
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const updateAccount = (
    input: EditAccountInput,
    options?: {
      successMessage?: string;
    }
  ) => {
    return editAccount({
      variables: { id, account: input },
      update: (
        cache,
        {
          data: {
            editAccount: { account }
          }
        }
      ) => editAccountCache(cache, account, user),
      onCompleted: () => {
        if (options?.successMessage) {
          enqueueSnackbar(options.successMessage, { variant: 'success' });
        }
      },
      onError: handleGQLError
    });
  };

  return { updateAccount, loading };
};
