import { History } from 'lucide-react';
import {
  AccountsIcon,
  CheckIcon,
  DebtsIcon,
  ForecastIcon,
  PaydayIcon,
  RemindersIcon
} from '~/components/icons';
import { accentTagClasses, redTagClasses } from '~/components/payments';
import { LetterIcon } from '~/components/ui';
import { cn } from '~/lib/cn';
import { logoIconUrl, readLogoInput } from '~/lib/icons';
import {
  cardClasses,
  eyebrowClasses,
  featureBodyClasses,
  featureIconClasses,
  featureTitleClasses,
  h2Classes,
  wrapClasses
} from '../../landingClasses';

// The forecast card's little chart: the next six months, this one highlighted
const FORECAST_BARS = [
  { month: 'Nov', height: '40%' },
  { month: 'Dec', height: '52%' },
  { month: 'Jan', height: '46%' },
  { month: 'Feb', height: '60%' },
  { month: 'Mar', height: '66%' },
  { month: 'Apr', height: '76%' }
];

const PAYDAY_STEPS = [
  { label: 'Check what’s gone out', value: '2 accounts', isMoney: false },
  { label: 'Confirm where you get paid', value: '£12,765.00', isMoney: true },
  { label: 'Your other accounts', value: 'Savings', isMoney: false }
];

// The payment history card's example row shows Netflix's own logo, as a payment with one does
const NETFLIX_LOGO = logoIconUrl(readLogoInput('netflix.com'));

// A row in a card's little example, kept to one line
const mockRowClasses =
  'flex min-h-12 items-center gap-2.5 rounded-2xl bg-surface-2 px-3.5 py-2 text-[13px] font-bold whitespace-nowrap';

export const Features = () => (
  <section id="features" className={cn(wrapClasses, 'flex flex-col pb-14 md:pb-24')}>
    <span className={eyebrowClasses}>Features</span>
    <h2 className={cn(h2Classes, 'mt-3.5 max-w-[720px] md:mt-4')}>
      Everything between one payday and the next.
    </h2>

    <div className="mt-6 grid grid-cols-2 gap-3 md:mt-9 md:gap-4 min-[67.5rem]:grid-cols-4">
      <article className="relative col-span-2 flex flex-col overflow-hidden rounded-3xl bg-hero-bg p-6 text-hero-text md:rounded-[28px] md:p-8 min-[67.5rem]:row-span-2">
        <div
          aria-hidden="true"
          className="absolute -right-20 -bottom-[100px] size-60 rounded-full bg-hero-chip md:right-auto md:-bottom-[120px] md:-left-[100px] md:size-80"
        />
        <span className={cn(featureIconClasses, 'relative bg-hero-chip text-hero-text')}>
          <PaydayIcon size={24} className="size-[22px] md:size-6" />
        </span>
        <h3 className={cn(featureTitleClasses, 'relative')}>Payday cycles</h3>
        <p className={cn(featureBodyClasses, 'relative text-hero-muted')}>
          Your money runs from payday to payday, not the 1st to the 31st. Each payday we check what
          has gone out of each account, confirm where you get paid and start the next cycle.
          Weekends and bank holidays are handled.
        </p>
        <div aria-hidden="true" className="relative mt-[18px] md:mt-auto md:pt-7">
          <div className="flex flex-col gap-2 rounded-[18px] bg-surface p-3.5 text-text shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] md:rounded-[22px] md:p-[18px]">
            <div className="mb-1.5 hidden items-center gap-3 md:flex">
              <span className="inline-flex size-10 items-center justify-center rounded-[14px] bg-accent text-on-accent">
                <PaydayIcon size={20} />
              </span>
              <div>
                <p className="text-[17px] font-extrabold tracking-[-0.02em]">It’s payday</p>
                <p className="text-xs font-semibold text-muted">
                  Friday 30 October · <span className="num text-income">+£3,600.00</span>
                </p>
              </div>
            </div>
            {PAYDAY_STEPS.map(step => (
              <div
                key={step.label}
                className="flex min-h-10 items-center gap-2.5 rounded-xl bg-surface-2 px-3 py-2 text-[13px] font-bold md:min-h-11 md:rounded-[14px] md:px-3.5">
                <span className="inline-flex size-[18px] shrink-0 items-center justify-center rounded-md bg-accent text-white md:size-5 md:rounded-[7px]">
                  <CheckIcon size={11} strokeWidth={4} />
                </span>
                {step.label}
                <span className={cn('ml-auto', step.isMoney ? 'num' : 'text-muted')}>
                  {step.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article
        className={cn(
          cardClasses,
          'col-span-2 flex flex-col gap-4 p-[22px] md:flex-row md:gap-7 md:p-8'
        )}>
        <div className="min-w-0 flex-1">
          <span className={featureIconClasses}>
            <ForecastIcon size={24} className="size-[22px] md:size-6" />
          </span>
          <h3 className={featureTitleClasses}>Forecast</h3>
          <p className={featureBodyClasses}>
            See where your balance is heading months ahead, with every bill and one-off
            <span className="hidden md:inline"> payment</span> accounted for.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex h-[120px] items-end gap-2 md:h-auto md:w-[210px] md:shrink-0 md:pt-3">
          {FORECAST_BARS.map((bar, index) => (
            <div
              key={bar.month}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 md:gap-2">
              <div
                className={cn(
                  'w-full rounded-[9px] md:rounded-[10px]',
                  index === 0 ? 'bg-accent' : 'bg-accent-soft'
                )}
                style={{ height: bar.height }}
              />
              <span className="text-[11px] font-bold text-muted">{bar.month}</span>
            </div>
          ))}
        </div>
      </article>

      <article className={cn(cardClasses, 'col-span-2 p-[22px] md:p-8 min-[67.5rem]:col-span-1')}>
        <span className={featureIconClasses}>
          <AccountsIcon size={24} className="size-[22px] md:size-6" />
        </span>
        <h3 className={featureTitleClasses}>Accounts</h3>
        <p className={featureBodyClasses}>
          Keep your current account and savings together. Savings interest is added for you, and you
          see everything you have after what you owe.
        </p>
      </article>

      <article className={cn(cardClasses, 'col-span-2 p-[22px] md:p-8 min-[67.5rem]:col-span-1')}>
        <span className={featureIconClasses}>
          <DebtsIcon size={24} className="size-[22px] md:size-6" />
        </span>
        <h3 className={featureTitleClasses}>Debts</h3>
        <p className={featureBodyClasses}>
          Add loans and cards with their APR. Interest is worked out daily, and your payoff plan
          shows when each one is paid off.
        </p>
      </article>

      <article className={cn(cardClasses, 'col-span-2 p-[22px] md:p-8')}>
        <span className={featureIconClasses}>
          <RemindersIcon size={24} className="size-[22px] md:size-6" />
        </span>
        <h3 className={featureTitleClasses}>Reminders</h3>
        <p className={featureBodyClasses}>
          The bell shows what’s new and what’s coming up, so nothing catches you out.
        </p>
        <div aria-hidden="true" className="mt-[18px] flex flex-col gap-2 md:mt-[22px]">
          <div className={mockRowClasses}>
            <span className="size-2 shrink-0 rounded-full bg-accent" />
            Interest added
            <span className={cn(accentTagClasses, 'ml-auto h-6 px-2 text-[11px]')}>New</span>
          </div>
          <div className={mockRowClasses}>
            <span className="size-2 shrink-0 rounded-full bg-border-strong" />
            Car insurance renews
            <span className="ml-auto text-[11px] font-bold text-muted">Coming up</span>
          </div>
        </div>
      </article>

      <article className={cn(cardClasses, 'col-span-2 p-[22px] md:p-8')}>
        <span className={featureIconClasses}>
          <History size={24} className="size-[22px] md:size-6" />
        </span>
        <h3 className={featureTitleClasses}>Payment history</h3>
        <p className={featureBodyClasses}>
          Tick several off at once, add a note, and use See payments to look back at what you paid,
          including price rises.
        </p>
        <div
          aria-hidden="true"
          className={cn(mockRowClasses, 'mt-[18px] min-h-[60px] gap-3 md:mt-[22px]')}>
          <LetterIcon
            letter="N"
            iconUrl={NETFLIX_LOGO}
            className="size-9 rounded-xl text-sm"
            letterClassName="bg-expense-bg text-expense"
          />
          <span className="text-sm">Netflix</span>
          <span className="num font-semibold text-muted">£10.99 to £12.99</span>
          <span className={cn(redTagClasses, 'ml-auto h-6 px-2 text-[11px]')}>Price rise</span>
        </div>
      </article>
    </div>
  </section>
);
