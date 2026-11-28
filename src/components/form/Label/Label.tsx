import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

interface LabelProps extends ComponentProps<'label'> {
  // Forms and dialogs use muted labels; the sign in and profile screens use full-strength ones
  tone?: 'muted' | 'default';
}

export const Label = ({ tone = 'default', className, ...props }: LabelProps) => (
  <label
    className={cn(
      'mb-2 block text-[13px] font-bold',
      tone === 'muted' ? 'text-muted' : 'text-text',
      className
    )}
    {...props}
  />
);
