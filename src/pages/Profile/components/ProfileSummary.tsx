import { CalendarDays } from 'lucide-react';
import { CurrentUserQuery } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { formatShortDay } from '~/lib/dates';
import { getInitials } from '~/lib/format';
import { paydayPlan } from '../profileModel';

type User = NonNullable<CurrentUserQuery['tokenFindUser']>;

interface ProfileSummaryProps {
  user: User;
  account: Account;
  compact: boolean;
}

/* Who's signed in and how they're paid. On mobile it's the accent hero card. */
export const ProfileSummary = ({ user, account, compact }: ProfileSummaryProps) => {
  const { cycle } = usePayCycle(account.payday);
  const initials = getInitials(user.firstName, user.surname);
  const name = `${user.firstName} ${user.surname}`;
  const plan = paydayPlan(account.payday);
  const next = formatShortDay(cycle.end);

  if (compact) {
    return (
      <section
        aria-label="Account summary"
        className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-hero-bg p-5 text-hero-text">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-[70px] -right-[60px] size-[180px] rounded-full bg-hero-chip"
        />
        <div className="relative flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-hero-text text-[22px] font-extrabold text-hero-ink shadow-[0_0_0_4px_var(--hero-chip)]">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-[22px] leading-[1.15] font-extrabold tracking-[-0.03em]">{name}</p>
            <p className="mt-1 text-[13px] font-medium wrap-anywhere text-hero-muted">
              {user.email}
            </p>
          </div>
        </div>
        <div className="relative flex items-center justify-between gap-2.5 border-t border-hero-chip pt-3.5 text-[13px]">
          <span className="inline-flex min-w-0 items-center gap-2 font-medium text-hero-muted">
            <CalendarDays size={16} aria-hidden="true" className="shrink-0" />
            {plan}
          </span>
          <span className="shrink-0 font-extrabold">
            <span className="sr-only">Next payday </span>
            {next}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Account summary"
      className="flex flex-wrap items-center gap-5 rounded-3xl border border-border bg-surface px-7 py-6">
      <span
        aria-hidden="true"
        className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent text-[22px] font-extrabold text-on-accent shadow-[0_0_0_4px_var(--accent-soft)]">
        {initials}
      </span>
      <div className="flex min-w-[200px] grow flex-col gap-1">
        <p className="text-xl font-extrabold tracking-[-0.02em]">{name}</p>
        <p className="text-sm font-medium wrap-anywhere text-muted">{user.email}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex h-8 items-center rounded-full bg-accent-soft px-3 text-xs font-bold text-accent-text">
          {plan}
        </span>
        <span className="inline-flex h-8 items-center gap-1 rounded-full border border-border-strong px-3 text-xs font-bold text-muted">
          Next payday <span className="text-text">{next}</span>
        </span>
      </div>
    </section>
  );
};
