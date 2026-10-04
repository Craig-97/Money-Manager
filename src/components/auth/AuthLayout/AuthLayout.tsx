import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { PageName } from '~/app/routes/pageModules';
import { BrandMark } from '~/components/ui/BrandMark';
import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';

interface BackLink {
  page: PageName;
  to: string;
  label: string;
}

interface AuthLayoutProps {
  // The brand panel's content beside the form, from 980px (see AuthPanel)
  panel: ReactNode;
  // A chevron in the mobile header and a pill above the form on desktop
  back: BackLink;
  // The end of the desktop top bar, e.g. "New here? Create an account"
  topBarEnd?: ReactNode;
  // Widens the form column, for register's two name fields
  wide?: boolean;
  // Classes for the column holding the page content
  className?: string;
  children: ReactNode;
}

/*
 * The sign in, register and password reset screens. Below 768px they're a single mobile column.
 * From 768px the form is centred under a top bar, and from 980px the brand panel sits beside it.
 */
export const AuthLayout = ({
  panel,
  back,
  topBarEnd,
  wide = false,
  className,
  children
}: AuthLayoutProps) => (
  <div className="flex min-h-dvh flex-col px-4 pt-3 pb-8 md:p-4 split:grid split:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] split:gap-4">
    <aside className="relative hidden flex-col gap-9 overflow-hidden rounded-[32px] bg-hero-bg px-11 py-10 text-hero-text split:flex">
      <div
        aria-hidden="true"
        className="absolute -top-[140px] -right-[140px] size-[420px] rounded-full bg-hero-chip"
      />
      <div
        aria-hidden="true"
        className="absolute top-[120px] right-[60px] size-40 rounded-full bg-hero-chip"
      />
      <PageLink
        page="landing"
        to={ROUTES.home}
        className="relative inline-flex items-center gap-2.5 self-start text-hero-text no-underline">
        <BrandMark className="size-[34px] rounded-[11px] bg-hero-text text-[17px] text-hero-bg" />
        <span className="text-[17px] font-extrabold tracking-[-0.02em]">Money Manager</span>
      </PageLink>
      {panel}
    </aside>

    <main className="flex flex-1 flex-col gap-5 md:gap-0 md:px-2 md:pt-2 md:pb-6">
      <header className="flex items-center justify-between md:hidden">
        <PageLink
          page={back.page}
          to={back.to}
          aria-label={back.label}
          className="-ml-1.5 inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-text">
          <ChevronLeft size={22} strokeWidth={2.25} aria-hidden="true" />
        </PageLink>
        <div className="inline-flex items-center gap-[9px]">
          <BrandMark />
          <span className="text-base font-extrabold tracking-[-0.02em]">Money Manager</span>
        </div>
        {/* Balances the back button so the logo stays centred */}
        <span aria-hidden="true" className="w-11" />
      </header>

      <div className="hidden items-center justify-between gap-3 md:flex">
        <PageLink
          page={back.page}
          to={back.to}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-muted no-underline transition-colors hover:bg-hover hover:text-text">
          <ChevronLeft size={18} strokeWidth={2.25} aria-hidden="true" />
          {back.label}
        </PageLink>
        {topBarEnd ? <div className="text-sm font-semibold text-muted">{topBarEnd}</div> : null}
      </div>

      <div className="flex flex-1 flex-col md:items-center md:justify-center md:py-10">
        <div
          className={cn(
            'flex w-full flex-1 flex-col gap-5 md:flex-none md:gap-0',
            wide ? 'md:max-w-[460px]' : 'md:max-w-[440px]',
            className
          )}>
          {children}
        </div>
      </div>

      <p className="hidden text-center text-[13px] font-medium text-muted md:block">
        © Money Manager
      </p>
    </main>
  </div>
);
