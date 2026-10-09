import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { linkButtonClasses, stepCardClasses } from '../setupClasses';

interface ReviewCardProps {
  label: string;
  onEdit: () => void;
  disabled: boolean;
  children: ReactNode;
}

export const ReviewCard = ({ label, onEdit, disabled, children }: ReviewCardProps) => (
  <div className={cn(stepCardClasses, 'flex flex-col gap-1.5 px-[22px] py-5')}>
    <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-muted">
      {label}
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
        className={linkButtonClasses}>
        Edit
      </button>
    </div>
    {children}
  </div>
);
