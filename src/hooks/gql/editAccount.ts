import { useMutation } from '@apollo/client';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useSnackbar } from '~/state';
import { useAccountStore, useUserContext } from '~/state';

interface EditAccountInput {
  bankBalance?: number;
  monthlyIncome?: number;
}

interface UpdateAccountParams {
  input: EditAccountInput;
  options?: {
    successMessage?: string;
  };
}

export const useEditAccount = () => {
  const { user } = useUserContext();
  const id = useAccountStore(s => s.account.id);
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [editAccount, { loading }] = useMutation(EDIT_ACCOUNT_MUTATION);

  const updateAccount = ({ input, options }: UpdateAccountParams) => {
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
