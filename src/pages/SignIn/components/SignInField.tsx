import { ComponentProps } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '~/lib/cn';

interface SignInFieldProps extends ComponentProps<'input'> {
  id: string;
  label: string;
  error?: string;
}

/* A labelled input with its error message, styled like the design's auth fields */
export const SignInField = ({ id, label, error, className, ...props }: SignInFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-bold">
        {label}
      </label>
      <div
        className={cn(
          'flex h-14 items-center rounded-[18px] border-[1.5px] border-border-strong bg-surface-2 px-4 focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]',
          error &&
            'border-expense shadow-[0_0_0_4px_var(--expense-bg)] focus-within:border-expense focus-within:shadow-[0_0_0_4px_var(--expense-bg)]'
        )}>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold text-text outline-none placeholder:text-faint',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p
          id={errorId}
          className="mt-2 flex items-start gap-[7px] text-[13px] leading-[1.4] font-semibold text-expense">
          <CircleAlert size={16} className="mt-px shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
};
