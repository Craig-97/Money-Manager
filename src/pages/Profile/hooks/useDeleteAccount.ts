import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { DeleteCurrentUserDocument } from '~/graphql/generated';
import { useLogout } from '~/hooks/useLogout';
import { getApiErrorMessage } from '~/lib/errors';

/* Deleting the account, behind a confirmation. Signs out once it's gone. */
export const useDeleteAccount = () => {
  const [deleteCurrentUser, { loading: deleting }] = useMutation(DeleteCurrentUserDocument);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    try {
      await deleteCurrentUser();
      setOpen(false);
      logout();
    } catch (caught) {
      setError(getApiErrorMessage(caught, "Couldn't delete your account. Try again."));
    }
  };

  return {
    open,
    setOpen: (next: boolean) => {
      setOpen(next);
      if (!next) setError(null);
    },
    error,
    deleting,
    confirm: () => void confirm()
  };
};
