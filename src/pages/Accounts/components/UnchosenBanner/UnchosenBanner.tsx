import { ChevronRight, Info } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { joinNames } from '~/lib/accounts';
import { useSetupAccountsStore } from '~/state/setupAccounts';

interface UnchosenBannerProps {
  // The payments that don't say, by name
  names: readonly string[];
  // Where pay lands, which they come out of until they say otherwise
  paidIntoName: string;
  // Mobile: the whole tile opens the setup
  compact: boolean;
}

const iconClasses =
  'inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-warn-bg text-warn';

/*
 * Some payments don't say which account they come out of, once there's more than one. Every name
 * is listed, so they wrap rather than being cut short.
 */
export const UnchosenBanner = ({ names, paidIntoName, compact }: UnchosenBannerProps) => {
  const openSetup = useSetupAccountsStore(s => s.openSetup);
  const count = names.length;
  const title = `${count} ${count === 1 ? 'payment doesn’t' : 'payments don’t'} say which account ${count === 1 ? 'it comes' : 'they come'} from`;
  const sub = `${joinNames(names)} ${count === 1 ? 'comes' : 'come'} out of ${paidIntoName}, where you get paid, until you choose.`;
  const icon = (
    <span aria-hidden="true" className={iconClasses}>
      <Info size={17} />
    </span>
  );

  if (compact) {
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={openSetup}
        className="flex w-full cursor-pointer items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-3.5 text-left transition-colors hover:bg-hover">
        {icon}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm leading-[1.35] font-bold">{title}</span>
          <span className="text-xs leading-[1.4] font-semibold [overflow-wrap:anywhere] text-muted">
            {sub}
          </span>
          <span className="mt-1 text-[13px] font-bold text-accent-text">Choose accounts</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      aria-label="Payments without an account"
      className="flex flex-wrap items-center gap-3.5 rounded-3xl border border-border bg-surface py-4 pr-5 pl-6">
      {icon}
      <span className="flex min-w-[260px] flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-bold">{title}</span>
        <span className="text-[13px] font-semibold [overflow-wrap:anywhere] text-muted">{sub}</span>
      </span>
      <Button aria-haspopup="dialog" onClick={openSetup} className="px-[18px]">
        Choose accounts
      </Button>
    </section>
  );
};
