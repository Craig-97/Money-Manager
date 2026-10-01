import { useMutation } from '@apollo/client/react';
import { EDIT_ACCOUNT_MUTATION, editAccountCache } from '~/graphql';
import { useErrorHandler } from '~/hooks';
import { useSnackbar } from '~/state';
import { useAccountStore, useUserContext } from '~/state';
import { Account } from '~/types';

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

interface EditAccountResult {
  editAccount: {
    account: Account;
  };
}

export const useEditAccount = () => {
  const { user } = useUserContext();
  const id = useAccountStore(s => s.account.id);
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [editAccount, { loading }] = useMutation<EditAccountResult>(EDIT_ACCOUNT_MUTATION);

  const updateAccount = ({ input, options }: UpdateAccountParams) => {
    return editAccount({
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
  };

  return { updateAccount, loading };
};
