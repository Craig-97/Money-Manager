import { formatBalance, formatMoney, MINUS } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { summariseFirstCycle } from '../setupModel';

type FirstCycleSummaryProps = ReturnType<typeof summariseFirstCycle>;

const rowClasses =
  'flex items-center justify-between gap-3 border-t border-hero-chip py-3 text-sm font-semibold';

/* The accent card beside the form from 1180px, updating as the answers change */
export const FirstCycleSummary = ({
  cycleEnd,
  balance,
  regularsDue,
  regularsDueCount,
  oneOffsNet,
  oneOffsDueCount,
  freeToSpend,
  spokenForPercent
}: FirstCycleSummaryProps) => (
  <aside aria-label="Your first cycle" className="sticky top-10 hidden min-[73.75rem]:block">
    <div className="relative flex flex-col gap-1 overflow-hidden rounded-[28px] bg-hero-bg p-[22px] text-hero-text">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[70px] -right-[60px] size-[180px] rounded-full bg-hero-chip"
      />
      <p className="relative text-[13px] font-bold text-hero-muted">Your first cycle</p>
      <p className="relative mb-2.5 text-[15px] font-extrabold">
        Today to {formatShortDate(cycleEnd)}
      </p>
      <div className={rowClasses}>
        <span className="text-hero-muted">Bank balance</span>
        <span className="num">{formatMoney(balance)}</span>
      </div>
      <div className={rowClasses}>
        <span className="text-hero-muted">
          Regular payments <span className="num">({regularsDueCount})</span>
        </span>
        <span className="num">
          {MINUS}
          {formatMoney(regularsDue)}
        </span>
      </div>
      <div className={rowClasses}>
        <span className="text-hero-muted">
          Coming up <span className="num">({oneOffsDueCount})</span>
        </span>
        <span className="num">
          {oneOffsNet < 0 ? MINUS : oneOffsNet > 0 ? '+' : ''}
          {formatMoney(oneOffsNet)}
        </span>
      </div>
      <div className="relative mt-1 flex flex-col gap-2.5 border-t border-hero-muted pt-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-extrabold">Free to spend</span>
          <span className="num text-2xl font-extrabold tracking-[-0.03em]">
            {formatBalance(freeToSpend)}
          </span>
        </div>
        <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-hero-chip">
          <div
            className="h-full rounded-full bg-hero-text"
            style={{ width: `${spokenForPercent}%` }}
          />
        </div>
        <p className="text-xs leading-[1.45] text-hero-muted">
          <span className="num font-extrabold text-hero-text">{spokenForPercent}%</span> of your
          balance is already spoken for.
        </p>
      </div>
    </div>
    <p className="mx-1 mt-3.5 text-xs leading-normal text-muted">
      Updates as you go. Nothing is saved until you finish.
    </p>
  </aside>
);
