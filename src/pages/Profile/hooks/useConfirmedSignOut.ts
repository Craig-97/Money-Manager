import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { DeleteCurrentUserDocument, LogoutEverywhereDocument } from '~/graphql/generated';
import { useLogout } from '~/hooks/useLogout';
import { getApiErrorMessage } from '~/lib/errors';

/*
 * Something that ends with signing out, behind a confirmation: deleting the account, or signing out
 * on every device. Signs out here once it's done.
 */
export const useConfirmedSignOut = (
  mutation: typeof DeleteCurrentUserDocument | typeof LogoutEverywhereDocument,
  { failed }: { failed: string }
) => {
  const [run, { loading }] = useMutation(mutation);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    try {
      await run();
      setOpen(false);
      logout();
    } catch (caught) {
      setError(getApiErrorMessage(caught, failed));
    }
  };

  return {
    open,
    setOpen: (next: boolean) => {
      setOpen(next);
      if (!next) setError(null);
    },
    error,
    loading,
    confirm: () => void confirm()
  };
};

export type ConfirmedSignOut = ReturnType<typeof useConfirmedSignOut>;
