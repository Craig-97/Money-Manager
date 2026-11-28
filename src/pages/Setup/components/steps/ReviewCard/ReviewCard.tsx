import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { useSetupDesktop } from '../../../hooks';
import { linkButtonClasses, stepCardClasses } from '../setupClasses';

interface ReviewCardProps {
  label: string;
  // After the label on desktop, under it on mobile: "£80.00 a month going out"
  sub?: ReactNode;
  onEdit: () => void;
  disabled: boolean;
  // A list of rows, which runs closer to the card's bottom edge
  list?: boolean;
  children: ReactNode;
}

/* One part of the review with its Edit button: a small label on desktop, a heading on mobile */
export const ReviewCard = ({ label, sub, onEdit, disabled, list, children }: ReviewCardProps) => {
  const isDesktop = useSetupDesktop();
  const edit = (
    <button
      type="button"
      disabled={disabled}
      onClick={onEdit}
      aria-label={`Edit ${label.toLowerCase()}`}
      className={linkButtonClasses}>
      Edit
    </button>
  );

  if (!isDesktop) {
    return (
      <div className={cn(stepCardClasses, 'overflow-hidden')}>
        <div className="flex min-h-[52px] items-center gap-2 px-4 py-2.5">
          <div className="min-w-0 grow">
            <h2 className="text-[15px] font-extrabold">{label}</h2>
            {sub ? <p className="mt-0.5 text-xs text-muted">{sub}</p> : null}
          </div>
          {edit}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        stepCardClasses,
        'flex flex-col gap-1.5 px-[22px] pt-5',
        list ? 'pb-2' : 'pb-5'
      )}>
      <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-muted">
        <h2>
          {label}
          {sub ? <> · {sub}</> : null}
        </h2>
        {edit}
      </div>
      {children}
    </div>
  );
};
