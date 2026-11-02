import { ChevronRight, Percent } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useReminders } from '~/hooks/useReminders';
import { useAccountQuickStore } from '~/state/accountQuick';

const iconClasses =
  'inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-income-bg text-income';

/*
 * A savings account's interest has been paid and is waiting to be checked, as its reminder in New
 * says. Later puts both away until tomorrow. One at a time, the oldest first.
 */
export const InterestBanner = ({ compact }: { compact: boolean }) => {
  const { fresh } = useReminders();
  const openQuick = useAccountQuickStore(s => s.openFor);
  const waiting = fresh.filter(reminder => reminder.kind === 'interest' && reminder.account);
  const reminder = waiting.at(-1);
  if (!reminder?.account) return null;
  const { account } = reminder;
  const check = () => openQuick('check', { accountId: account.id });
  const icon = (
    <span aria-hidden="true" className={iconClasses}>
      <Percent size={17} />
    </span>
  );

  if (compact) {
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={check}
        className="flex w-full cursor-pointer items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-3.5 text-left transition-colors hover:bg-hover">
        {icon}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm leading-[1.35] font-bold">{reminder.title}</span>
          <span className="text-xs leading-[1.4] font-semibold text-muted">{reminder.body}</span>
          <span className="mt-1 text-[13px] font-bold text-accent-text">Check interest</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      aria-label="Interest to check"
      className="flex flex-wrap items-center gap-3.5 rounded-3xl border border-border bg-surface py-4 pr-5 pl-6">
      {icon}
      <span className="flex min-w-[260px] flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-bold">{reminder.title}</span>
        <span className="text-[13px] font-semibold text-muted">{reminder.body}</span>
      </span>
      <Button aria-haspopup="dialog" onClick={check} className="px-[18px]">
        Check interest
      </Button>
    </section>
  );
};
