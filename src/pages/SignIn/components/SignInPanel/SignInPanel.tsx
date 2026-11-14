import { AuthPanel } from '~/components/auth/AuthPanel';

// Example figures, to show what the app does
const STATS = [
  { label: 'Next payday', value: 'Fri 30 Oct · 28 days' },
  { label: 'Upcoming before payday', value: '£815.00', isMoney: true }
];

/* The brand panel beside the sign in form */
export const SignInPanel = () => (
  <AuthPanel
    title="Pick up where you left off."
    lead="Your balance, bills and subscriptions, tracked from one payday to the next.">
    <div aria-hidden="true" className="relative grid grid-cols-2 gap-3">
      <div className="col-span-2 flex items-end justify-between gap-4 rounded-[22px] bg-hero-chip px-6 py-[22px]">
        <div>
          <p className="text-[13px] font-semibold text-hero-muted">Free to spend</p>
          <p className="mt-1.5 num text-[40px] font-extrabold tracking-[-0.05em]">£9,185.00</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold text-hero-muted">About a day</p>
          <p className="mt-1.5 num text-xl font-extrabold">£328</p>
        </div>
      </div>
      {STATS.map(stat => (
        <div key={stat.label} className="rounded-[22px] bg-hero-chip px-5 py-[18px]">
          <p className="text-xs font-semibold text-hero-muted">{stat.label}</p>
          <p
            className={
              stat.isMoney
                ? 'mt-1.5 num text-base font-extrabold'
                : 'mt-1.5 text-base font-extrabold'
            }>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  </AuthPanel>
);
