import { cn } from '~/lib/cn';
import { TextInput, TextInputProps } from '../TextInput';

// md sits in forms and dialogs; hero is the big balance and income entry in setup and payday
const SIZES = {
  md: { box: '', text: 'text-[15px] tracking-[-0.02em]' },
  hero: {
    box: 'h-[60px] rounded-[18px] px-[18px]',
    text: 'text-[26px] leading-none tracking-[-0.03em]'
  }
} as const;

interface AmountInputProps extends Omit<TextInputProps, 'size' | 'prefix' | 'type' | 'inputMode'> {
  size?: keyof typeof SIZES;
}

/* A money amount in pounds, with the £ sign inside the box */
export const AmountInput = ({
  size = 'md',
  boxClassName,
  className,
  ...props
}: AmountInputProps) => (
  <TextInput
    {...props}
    type="text"
    inputMode="decimal"
    autoComplete="off"
    boxClassName={cn(SIZES[size].box, boxClassName)}
    prefix={
      <span aria-hidden="true" className={cn('font-extrabold text-muted', SIZES[size].text)}>
        £
      </span>
    }
    className={cn('[font-feature-settings:"tnum"] font-extrabold', SIZES[size].text, className)}
  />
);
