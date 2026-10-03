import { ErrorState } from '~/components/feedback/ErrorState';
import { Button } from '~/components/ui/Button';

export const AccountLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex min-h-dvh items-center justify-center p-4">
    <ErrorState
      title="Couldn't load your account"
      message="Check your connection and try again."
      action={
        <Button variant="solid" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  </div>
);
