import { Account, accountLetter } from '~/lib/accounts';
import { cn } from '~/lib/cn';

const SIZES = {
  // Beside a field in a dialog
  sm: 'size-9 rounded-xl text-sm',
  md: 'size-[38px] rounded-xl text-sm',
  // A phone's account rows
  lg: 'size-10 rounded-[13px] text-[15px]'
} as const;

interface AccountLetterProps {
  account: Pick<Account, 'name'>;
  size?: keyof typeof SIZES;
  // On a grey card it takes the page's colour, so it still stands out
  onGrey?: boolean;
  className?: string;
}

/* An account's first letter in a small square, as its icon */
export const AccountLetter = ({
  account,
  size = 'md',
  onGrey = false,
  className
}: AccountLetterProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-flex shrink-0 items-center justify-center border border-border font-extrabold',
      SIZES[size],
      onGrey ? 'bg-surface' : 'bg-surface-2',
      className
    )}>
    {accountLetter(account)}
  </span>
);
