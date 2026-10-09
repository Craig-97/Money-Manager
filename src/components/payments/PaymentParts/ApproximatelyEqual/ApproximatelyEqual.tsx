import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';

interface ApproximatelyEqualProps {
  // The payments counted at their monthly average, negative for money out
  averaged: { name: string; perMonth: number }[];
  // Without the hover card, where there's no room for one
  hint?: boolean;
}

/*
 * "≈" before a monthly total that counts weekly or fortnightly payments at their average. Hover
 * or focus lists which ones. Nothing when no payment is averaged.
 */
export const ApproximatelyEqual = ({ averaged, hint = true }: ApproximatelyEqualProps) => {
  if (!averaged.length) return null;
  const mark = (
    <span tabIndex={hint ? 0 : undefined} className="cursor-help rounded-md text-muted">
      <span aria-hidden="true">≈</span>
      <span className="sr-only">About</span>{' '}
    </span>
  );
  if (!hint) return mark;
  return (
    <Tooltip
      side="top"
      tone="card"
      label={
        <>
          <span className="font-bold">Includes monthly averages</span>
          {averaged.map(payment => (
            <span
              key={payment.name}
              className={cn(
                'num font-bold',
                payment.perMonth < 0 ? 'text-expense' : 'text-income'
              )}>
              {payment.name} {formatPayment(payment.perMonth)}/mo
            </span>
          ))}
        </>
      }>
      {mark}
    </Tooltip>
  );
};
