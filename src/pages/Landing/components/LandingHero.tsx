import { ArrowRightIcon, CalendarIcon, CheckIcon } from '~/components/icons';
import { buttonVariants } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { HeroDemo } from './HeroDemo';
import { eyebrowClasses, wrapClasses } from './landingClasses';

const POINTS = ['Sign up with just your email', 'Set up in a few minutes', 'Phone and desktop'];

const ctaClasses = 'w-full font-bold md:w-auto md:px-[26px]';

export const LandingHero = () => (
  <section
    className={cn(
      wrapClasses,
      'grid items-center gap-7 pt-7 pb-14 md:pt-12 md:pb-24 min-[67.5rem]:grid-cols-2 min-[67.5rem]:gap-14'
    )}>
    <div className="flex flex-col pt-3 md:pt-0">
      <span className={eyebrowClasses}>
        <CalendarIcon size={16} className="size-[15px] md:size-4" />
        Budgeting from payday to payday
      </span>
      <h1 className="mt-[18px] text-[44px] leading-[1.02] font-extrabold tracking-[-0.05em] md:mt-[22px] md:text-[72px] md:leading-none">
        Know what's left before payday.
      </h1>
      <p className="mt-[18px] max-w-[520px] text-base leading-[1.6] font-medium text-muted md:mt-[22px] md:text-[19px]">
        Money Manager tracks your balance, bills and subscriptions from one payday to the next, so
        you always know what's actually spare.
      </p>
      <div className="mt-6 flex flex-col gap-2.5 md:mt-[34px] md:flex-row md:flex-wrap md:gap-3">
        <PageLink
          page="register"
          to={ROUTES.register}
          className={buttonVariants({ variant: 'accent', size: 'xl', className: ctaClasses })}>
          Create account
          <ArrowRightIcon size={18} className="hidden md:block" />
        </PageLink>
        <PageLink
          page="signIn"
          to={ROUTES.signIn}
          className={buttonVariants({ size: 'xl', className: ctaClasses })}>
          Sign in
        </PageLink>
      </div>
      <ul className="mt-8 hidden flex-wrap gap-5 text-sm font-semibold text-muted md:flex">
        {POINTS.map(point => (
          <li key={point} className="inline-flex items-center gap-2">
            <CheckIcon size={16} strokeWidth={2.75} className="text-income" />
            {point}
          </li>
        ))}
      </ul>
    </div>

    <HeroDemo />
  </section>
);
