import { Button } from '../../ui';

interface PaymentsLoadErrorProps {
  onRetry: () => void;
}

/* A debt's payments couldn't load, on desktop and phone alike */
export const PaymentsLoadError = ({ onRetry }: PaymentsLoadErrorProps) => (
  <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
    <p className="text-sm font-semibold">Couldn’t load the payments</p>
    <Button onClick={onRetry}>Try again</Button>
  </div>
);
