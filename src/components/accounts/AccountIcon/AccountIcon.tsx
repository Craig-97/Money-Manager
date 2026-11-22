import { Account, accountLetter } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { LetterIcon } from '../../ui';

const SIZES = {
  // Beside a field in a dialog
  sm: 'size-9 rounded-xl text-sm',
  md: 'size-[38px] rounded-xl text-sm',
  // A phone's account rows
  lg: 'size-10 rounded-[13px] text-[15px]'
} as const;

interface AccountIconProps {
  account: Pick<Account, 'name' | 'iconUrl'>;
  size?: keyof typeof SIZES;
  // On a grey card it takes the page's colour, so it still stands out
  onGrey?: boolean;
  className?: string;
}

/* An account's logo, or its first letter in a small square */
export const AccountIcon = ({
  account,
  size = 'md',
  onGrey = false,
  className
}: AccountIconProps) => (
  <LetterIcon
    letter={accountLetter(account)}
    iconUrl={account.iconUrl}
    className={cn(SIZES[size], className)}
    letterClassName={cn('border border-border', onGrey ? 'bg-surface' : 'bg-surface-2')}
  />
);
