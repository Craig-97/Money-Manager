import { buttonVariants } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { h2Classes, wrapClasses } from './landingClasses';

const ctaClasses = 'w-full font-bold md:w-auto md:px-[26px]';

/* The closing call to action */
export const StartBand = () => (
  <section className={cn(wrapClasses, 'pb-14 md:pb-16')}>
    <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-[28px] bg-hero-bg px-[22px] py-7 text-hero-text md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-8 md:rounded-[32px] md:p-14">
      <div
        aria-hidden="true"
        className="absolute -top-[110px] -right-[90px] size-[260px] rounded-full bg-hero-chip md:-top-40 md:-right-[120px] md:size-[420px]"
      />
      <div className="relative max-w-[620px]">
        <h2 className={h2Classes}>Start your first cycle.</h2>
        <p className="mt-3.5 text-[15px] leading-[1.6] font-medium text-hero-muted md:text-[17px]">
          Create an account, tell us when you're paid and add what goes out. We'll show you what's
          left.
        </p>
      </div>
      <div className="relative mt-1.5 flex flex-col gap-2.5 md:mt-0 md:flex-row md:flex-wrap md:gap-3">
        <PageLink
          page="register"
          to={ROUTES.register}
          className={buttonVariants({ variant: 'inverse', size: 'xl', className: ctaClasses })}>
          Create account
        </PageLink>
        <PageLink
          page="signIn"
          to={ROUTES.signIn}
          className={buttonVariants({ variant: 'onHero', size: 'xl', className: ctaClasses })}>
          Sign in
        </PageLink>
      </div>
    </div>
  </section>
);
