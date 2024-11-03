import { useMutation } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useAccountContext } from '~/state';
import { useErrorHandler } from '~/hooks';

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
