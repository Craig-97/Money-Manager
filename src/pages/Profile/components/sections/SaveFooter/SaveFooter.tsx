import { ReactNode } from 'react';
import { Button } from '~/components/ui';
import { helpClasses } from '../settingsClasses';

interface SaveFooterProps {
  // What saving does; the API's error takes its place when saving fails
  help: ReactNode;
  error?: string;
  disabled: boolean;
  loading: boolean;
}

/* A settings tile's footer: a note on the left and Save changes, which submits the tile's form */
export const SaveFooter = ({ help, error, disabled, loading }: SaveFooterProps) => (
  <>
    <span className={helpClasses}>
      {error ? (
        <span role="alert" className="font-bold text-expense">
          {error}
        </span>
      ) : (
        help
      )}
    </span>
    <Button
      type="submit"
      variant="accent"
      disabled={disabled}
      loading={loading}
      loadingText="Saving…"
      className="font-bold">
      Save changes
    </Button>
  </>
);
