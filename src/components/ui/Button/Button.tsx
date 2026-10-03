import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';
import { Spinner } from '../Spinner';
import { ButtonSize, ButtonVariant, buttonVariants } from './buttonVariants';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  // Shows a spinner and loadingText and disables the button, without changing its size
  loading?: boolean;
  loadingText?: string;
}

export const Button = ({
  variant,
  size,
  loading = false,
  loadingText,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={buttonVariants({ variant, size, className })}
    {...props}>
    {loadingText === undefined ? (
      children
    ) : (
      // Both labels share one grid cell, so the button is always as wide as the longer one
      <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
        <span
          aria-hidden={loading}
          className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
          {children}
        </span>
        <span
          aria-hidden={!loading}
          className={cn('inline-flex items-center gap-2.5', !loading && 'invisible')}>
          <Spinner />
          {loadingText}
        </span>
      </span>
    )}
  </button>
);
