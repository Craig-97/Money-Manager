import { AccountError } from '~/components/feedback/AccountError';

/* The guards' error, on its own page: they show before the app shell */
export const AccountLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex min-h-dvh items-center justify-center p-4">
    <div className="w-full max-w-[520px]">
      <AccountError onRetry={onRetry} />
    </div>
  </div>
);
