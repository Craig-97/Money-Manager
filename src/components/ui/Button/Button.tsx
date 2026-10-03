import { ComponentProps } from 'react';
import { ButtonSize, ButtonVariant, buttonVariants } from './buttonVariants';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({ variant, size, className, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={buttonVariants({ variant, size, className })} {...props} />
);
