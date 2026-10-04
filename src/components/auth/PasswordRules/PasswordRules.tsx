import { Check } from 'lucide-react';
import { cn } from '~/lib/cn';
import { PASSWORD_RULES } from '~/lib/validation';

interface PasswordRulesProps {
  // Point the password input's aria-describedby at this id
  id: string;
  password: string;
  // The field has an error: rules not yet met turn red
  invalid?: boolean;
}

/* The new password rules as chips that tick off as you type */
export const PasswordRules = ({ id, password, invalid = false }: PasswordRulesProps) => (
  <ul id={id} className="mt-2.5 flex flex-wrap gap-2">
    {PASSWORD_RULES.map(({ label, test }) => {
      const met = test(password);
      return (
        <li
          key={label}
          className={cn(
            'inline-flex h-[34px] items-center gap-2 rounded-full border border-border bg-surface pr-3 pl-2 text-[13px] font-bold text-muted transition-colors',
            met && 'border-transparent bg-income-bg text-income',
            !met && invalid && 'border-expense text-expense'
          )}>
          <span
            aria-hidden="true"
            className={cn(
              'inline-flex size-5 items-center justify-center rounded-full border-[1.5px] border-border-strong',
              met && 'border-income bg-income text-bg'
            )}>
            {met ? <Check size={12} strokeWidth={3.5} /> : null}
          </span>
          {label}
          <span className="sr-only">{met ? ' (done)' : ' (not yet)'}</span>
        </li>
      );
    })}
  </ul>
);
