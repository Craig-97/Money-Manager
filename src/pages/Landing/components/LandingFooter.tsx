import { BrandMark } from '~/components/ui/BrandMark';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { wrapClasses } from './landingClasses';

const linkClasses =
  'inline-flex h-11 items-center rounded-full text-[13px] font-bold text-accent-text no-underline transition-colors hover:text-text md:px-4 md:text-sm md:text-muted md:hover:bg-hover';

export const LandingFooter = () => (
  <footer className={cn(wrapClasses, 'pb-7 md:pb-8')}>
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-[13px] font-semibold text-muted md:pt-6 md:text-sm">
      <div className="inline-flex items-center gap-2 md:gap-2.5">
        <BrandMark className="size-[26px] rounded-lg text-[13px] md:size-7 md:rounded-[9px] md:text-sm" />
        © Money Manager
      </div>
      <div className="flex gap-1">
        <PageLink page="signIn" to={ROUTES.signIn} className={linkClasses}>
          Sign in
        </PageLink>
        <PageLink
          page="register"
          to={ROUTES.register}
          className={cn(linkClasses, 'hidden md:inline-flex')}>
          Create account
        </PageLink>
      </div>
    </div>
  </footer>
);
