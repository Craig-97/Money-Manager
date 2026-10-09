import { ReactNode } from 'react';
import { tileLift } from '~/components/ui/Tile';
import { SectionId } from '../../../profileModel';

interface SettingsTileProps {
  id: SectionId;
  icon: ReactNode;
  title: string;
  description: string;
  // Shorter text for the mobile layout
  mobileDescription?: string;
  children: ReactNode;
  // Under a line at the bottom: a note and the save button
  footer?: ReactNode;
  // Tiles holding a form submit it from the footer's button
  onSubmit?: () => void;
}

/* A settings section: icon, title and description, the fields, then the footer */
export const SettingsTile = ({
  id,
  icon,
  title,
  description,
  mobileDescription = description,
  children,
  footer,
  onSubmit
}: SettingsTileProps) => {
  const content = (
    <>
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-text">
          {icon}
        </span>
        <div>
          <h2 id={`${id}-title`} className="text-lg font-extrabold tracking-[-0.02em]">
            {title}
          </h2>
          <p className="mt-1 text-[13px] leading-normal font-medium text-muted">
            <span className="md:hidden">{mobileDescription}</span>
            <span className="hidden md:inline">{description}</span>
          </p>
        </div>
      </div>
      {children}
      {footer ? (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 max-md:flex-col-reverse max-md:items-stretch max-md:text-center">
          {footer}
        </div>
      ) : null}
    </>
  );
  const classes = `flex min-w-0 scroll-mt-6 flex-col gap-5 rounded-3xl border border-border bg-surface p-5 md:p-6 ${tileLift}`;

  return onSubmit ? (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <form
        noValidate
        onSubmit={event => {
          event.preventDefault();
          onSubmit();
        }}
        className={classes}>
        {content}
      </form>
    </section>
  ) : (
    <section id={id} aria-labelledby={`${id}-title`} className={classes}>
      {content}
    </section>
  );
};
