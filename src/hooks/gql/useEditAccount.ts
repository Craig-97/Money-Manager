import { useMutation } from '@apollo/client/react';
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

  // Resolves to whether the update succeeded. Errors are already reported through onError,
  // so the rejection is swallowed to avoid an unhandled promise rejection
  const updateAccount = async ({ input, options }: UpdateAccountParams): Promise<boolean> => {
    try {
      await editAccount({
        variables: { id, account: input },
        update: (cache, { data }) => {
          const account = data?.editAccount?.account;
          if (!account) return;
          editAccountCache(cache, account, user);
        },
        onCompleted: () => {
          if (options?.successMessage) {
            enqueueSnackbar(options.successMessage, { variant: 'success' });
          }
        },
        onError: handleGQLError
      });
      return true;
    } catch {
      return false;
    }
  };

  return { updateAccount, loading };
};
