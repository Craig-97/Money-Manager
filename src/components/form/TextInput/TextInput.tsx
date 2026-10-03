import { ComponentProps, ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { bareInputClasses, FieldSize, fieldClasses } from '../fieldClasses';

export interface TextInputProps extends Omit<ComponentProps<'input'>, 'size' | 'prefix'> {
  size?: FieldSize;
  invalid?: boolean;
  // Shown inside the box before the input, e.g. a £ sign
  prefix?: ReactNode;
  // Shown inside the box after the input, e.g. a show password button
  suffix?: ReactNode;
  // Classes for the box rather than the input
  boxClassName?: string;
}

/* An input in the design's field box. Focus and errors show on the whole box. */
export const TextInput = ({
  size,
  invalid = false,
  prefix,
  suffix,
  boxClassName,
  className,
  ...props
}: TextInputProps) => (
  <div className={fieldClasses({ size, invalid, className: boxClassName })}>
    {prefix}
    <input
      aria-invalid={invalid || undefined}
      className={cn(bareInputClasses, className)}
      {...props}
    />
    {suffix}
  </div>
);
