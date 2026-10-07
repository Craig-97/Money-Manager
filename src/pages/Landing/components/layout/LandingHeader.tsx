import { BrandMark } from '~/components/ui/BrandMark';
import { buttonVariants } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { wrapClasses } from '../landingClasses';

const navLinkClasses =
  'hidden h-11 items-center rounded-full px-4 text-sm font-bold text-muted no-underline transition-colors hover:bg-hover hover:text-text md:inline-flex';

export const LandingHeader = () => (
  <header className={cn(wrapClasses, 'flex items-center justify-between gap-4 pt-3 md:py-6')}>
    <a
      href="#top"
      className="inline-flex h-11 items-center gap-[9px] text-text no-underline md:gap-2.5">
      <BrandMark className="md:size-[34px] md:rounded-[11px] md:text-[17px]" />
      <span className="text-base font-extrabold tracking-[-0.02em] md:text-[17px]">
        Money Manager
      </span>
    </a>
    <nav aria-label="Main" className="flex items-center gap-1.5">
      <a className={navLinkClasses} href="#how">
        How it works
      </a>
      <a className={navLinkClasses} href="#features">
        Features
      </a>
      {/* An outlined button on mobile, a plain nav link on desktop */}
      <PageLink
        page="signIn"
        to={ROUTES.signIn}
        className="inline-flex h-11 items-center rounded-full border border-border bg-surface px-[18px] text-sm font-bold text-text no-underline transition-colors hover:bg-hover md:border-transparent md:bg-transparent md:px-4 md:text-muted md:hover:text-text">
        Sign in
      </PageLink>
      <PageLink
        page="register"
        to={ROUTES.register}
        className={buttonVariants({
          variant: 'accent',
          className: 'ml-1.5 hidden font-bold md:inline-flex'
        })}>
        Create account
      </PageLink>
    </nav>
  </header>
);
