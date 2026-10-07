import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';

/* When the account couldn't be loaded */
export const AccountError = ({ onRetry }: { onRetry: () => void }) => (
  <article
    role="alert"
    className="flex min-h-[520px] flex-col items-center justify-center gap-2 rounded-3xl border border-border bg-surface px-5 py-8 text-center md:px-6 md:py-10">
    <span
      aria-hidden="true"
      className="mb-3 inline-flex size-14 items-center justify-center rounded-full bg-expense-bg text-expense">
      <TriangleAlert size={24} />
    </span>
    <h2 className="text-[22px] leading-[1.2] font-extrabold tracking-[-0.03em]">
      Couldn't load your account
    </h2>
    <p className="mb-4 max-w-[280px] text-sm font-medium text-muted md:max-w-[360px]">
      We couldn't reach the server. Check your connection, then try again.
    </p>
    <Button variant="accent" size="lg" onClick={onRetry} className="px-[22px] font-bold">
      <RefreshCw size={16} strokeWidth={2.25} aria-hidden="true" />
      Try again
    </Button>
  </article>
);
