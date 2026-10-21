import { PaySoonerCard } from '~/components/debts';
import { Button } from '~/components/ui/Button';
import { DebtDetailModel } from '../../hooks';

/* Some extra each month, and what it does to when the debt clears and the interest on it */
export const PaySooner = ({ detail }: { detail: DebtDetailModel }) => (
  <section aria-label="Pay sooner" className="flex flex-col gap-3.5">
    <PaySoonerCard sooner={detail} />
    {detail.applyLabel ? (
      <Button
        variant="accent"
        onClick={detail.apply}
        loading={detail.applying}
        className="h-[52px] w-full">
        {detail.applyLabel}
      </Button>
    ) : null}
    <p className="px-2 text-center text-xs font-medium text-muted">
      Estimates from your {detail.debt.debt.apr.toFixed(1)}% APR. Your statement is the final word.
    </p>
  </section>
);
