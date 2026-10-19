import { BudgetError } from '~/components/feedback/BudgetError';

/* The guards' error, on its own page: they show before the app shell */
export const BudgetLoadError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex min-h-dvh items-center justify-center p-4">
    <div className="w-full max-w-[520px]">
      <BudgetError onRetry={onRetry} />
    </div>
  </div>
);
