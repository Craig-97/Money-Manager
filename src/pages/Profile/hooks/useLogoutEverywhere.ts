import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { LogoutEverywhereDocument } from '~/graphql/generated';
import { useLogout } from '~/hooks/useLogout';
import { getApiErrorMessage } from '~/lib/errors';

/* Ending every device's session, behind a confirmation. Signs out here too once it's done. */
export const useLogoutEverywhere = () => {
  const [logoutEverywhere, { loading: signingOut }] = useMutation(LogoutEverywhereDocument);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    try {
      await logoutEverywhere();
      setOpen(false);
      logout();
    } catch (caught) {
      setError(getApiErrorMessage(caught, "Couldn't sign you out everywhere. Try again."));
    }
  };

  return {
    open,
    setOpen: (next: boolean) => {
      setOpen(next);
      if (!next) setError(null);
    },
    error,
    signingOut,
    confirm: () => void confirm()
  };
};
