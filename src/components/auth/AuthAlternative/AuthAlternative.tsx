import { ComponentType } from 'react';
import { PageName } from '~/app/routes/pageModules';
import { IconProps } from '~/components/icons';
import { buttonVariants } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';

interface AuthAlternativeProps {
  icon: ComponentType<IconProps>;
  // e.g. "New to Money Manager?"
  title: string;
  // Desktop only, under the title
  description: string;
  page: PageName;
  to: string;
  // The desktop card's small button
  label: string;
  // The mobile full-width button
  mobileLabel: string;
}

/*
 * The other way out of a form, e.g. to register from sign in. A card under the form on desktop;
 * a divided-off button at the bottom of the screen on mobile.
 */
export const AuthAlternative = ({
  icon: Icon,
  title,
  description,
  page,
  to,
  label,
  mobileLabel
}: AuthAlternativeProps) => (
  <>
    <div className="mt-auto flex flex-col gap-2.5 pt-3 md:hidden">
      <div className="flex items-center gap-3 text-[13px] font-semibold text-muted">
        <span aria-hidden="true" className="h-px grow bg-border" />
        {title}
        <span aria-hidden="true" className="h-px grow bg-border" />
      </div>
      <PageLink page={page} to={to} className={buttonVariants({ size: 'xl' })}>
        {mobileLabel}
      </PageLink>
    </div>

    <div className="mt-7 hidden items-center gap-3.5 rounded-[22px] border border-border bg-surface px-5 py-[18px] md:flex">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-text">
        <Icon size={20} />
      </span>
      <div className="min-w-0 grow">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-0.5 text-[13px] font-medium text-muted">{description}</p>
      </div>
      <PageLink page={page} to={to} className={buttonVariants({ className: 'font-bold' })}>
        {label}
      </PageLink>
    </div>
  </>
);
