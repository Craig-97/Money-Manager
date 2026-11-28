import { Button } from '../Button';

interface LoadErrorProps {
  // "Couldn’t load the payments"
  message: string;
  onRetry: () => void;
}

/* Something in a dialog or sheet couldn't load, with Try again: a payment's or an account's history */
export const LoadError = ({ message, onRetry }: LoadErrorProps) => (
  <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
    <p className="text-sm font-semibold">{message}</p>
    <Button onClick={onRetry}>Try again</Button>
  </div>
);
