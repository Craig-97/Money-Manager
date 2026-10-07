import { buttonVariants } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { cardClasses, eyebrowClasses, h2Classes, wrapClasses } from '../landingClasses';

// Mobile has shorter copy where the desktop text would wrap a lot
const STEPS = [
  {
    title: "Tell us when you're paid",
    text: 'Weekly, fortnightly, four-weekly or monthly — last working day, last Friday or a set date. Bank holidays handled.',
    mobileText:
      'Weekly, fortnightly, four-weekly or monthly — last working day, last Friday or a set date.'
  },
  {
    title: 'Add your regular payments',
    text: 'Tap Rent, Council tax, Netflix and the rest to add them, then set the amount and date. Add one-offs as they come up.',
    mobileText: 'Tap Rent, Council tax, Netflix and the rest, then set the amount and date.'
  },
  {
    title: 'Start each cycle in one tap',
    text: 'On payday we ask you to confirm your balance, then reset your recurring payments for the month ahead.',
    mobileText: 'On payday, confirm your balance and reset recurring payments for the month ahead.'
  }
];

export const HowItWorks = () => (
  <section id="how" className={cn(wrapClasses, 'pb-14 md:pt-6 md:pb-24')}>
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col">
        <span className={eyebrowClasses}>How it works</span>
        <h2 className={cn(h2Classes, 'mt-3.5 md:mt-4')}>Three steps, then one tap each payday.</h2>
      </div>
      <PageLink
        page="register"
        to={ROUTES.register}
        className={buttonVariants({
          size: 'xl',
          className: 'hidden px-[26px] font-bold md:inline-flex'
        })}>
        Get started
      </PageLink>
    </div>
    <ol className="mt-6 grid gap-3 md:mt-9 md:gap-4 min-[67.5rem]:grid-cols-3">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          className={cn(cardClasses, 'flex gap-4 p-5 md:flex-col md:gap-3.5 md:p-7')}>
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-extrabold text-on-accent md:size-11 md:text-[17px]">
            {index + 1}
          </span>
          <div>
            <h3 className="text-[17px] font-extrabold tracking-[-0.02em] md:mt-2 md:text-[22px] md:tracking-[-0.03em]">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-[1.55] font-medium text-muted md:mt-3.5 md:text-[15px]">
              <span className="md:hidden">{step.mobileText}</span>
              <span className="hidden md:inline">{step.text}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);
