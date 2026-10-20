import { ListChecks } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useSetupAccountsStore } from '~/state/setupAccounts';

interface UnchosenBannerProps {
  count: number;
  // Where pay lands, which they come out of until they say otherwise
  paidIntoName: string;
}

/* Some payments don't say which account they come out of, once there's more than one */
export const UnchosenBanner = ({ count, paidIntoName }: UnchosenBannerProps) => {
  const openSetup = useSetupAccountsStore(s => s.openSetup);

  return (
    <div
      role="status"
      aria-labelledby="unchosen-title"
      className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-3xl border border-border bg-surface px-4 py-3.5">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-accent-soft text-accent-text">
        <ListChecks size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span id="unchosen-title" className="text-sm font-bold">
          {count} {count === 1 ? 'payment doesn’t' : 'payments don’t'} say which account{' '}
          {count === 1 ? 'it comes' : 'they come'} from
        </span>
        <span className="text-xs font-semibold text-muted">
          Until you choose, {count === 1 ? 'it comes' : 'they come'} out of {paidIntoName}, where
          you get paid.
        </span>
      </span>
      <Button onClick={openSetup} className="px-4 max-md:w-full">
        Choose accounts
      </Button>
    </div>
  );
};
