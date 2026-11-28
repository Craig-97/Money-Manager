import { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '~/lib/cn';

interface ErrorStateProps {
  title: string;
  message: string;
  // Usually a "Try again" button
  action?: ReactNode;
  className?: string;
}

export const ErrorState = ({ title, message, action, className }: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      'flex w-full max-w-md flex-col items-start gap-4 rounded-3xl border border-border bg-surface p-6',
      className
    )}>
    <span className="inline-flex size-10 items-center justify-center rounded-full bg-expense-bg text-expense">
      <CircleAlert size={20} aria-hidden="true" />
    </span>
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm leading-normal text-muted">{message}</p>
    </div>
    {action}
  </div>
);
