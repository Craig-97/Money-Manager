import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatMoney, MINUS } from '~/lib/format';
import { SetupState, useSetupDesktop } from '../../../hooks';
import { MAX_ONE_OFFS, setupAccounts } from '../../../setupModel';
import { oneOffDetails } from '../../../setupPayments';
import { stepCardClasses } from '../setupClasses';
import { SetupRow } from '../SetupRow';

/*
 * Step 4: one-off payments already known about, added with the same form as anywhere else in the
 * app. Optional.
 */
export const ComingUpStep = ({ setup, today }: { setup: SetupState; today: Date }) => {
  const isDesktop = useSetupDesktop();
  const { oneOffs } = setup.values;
  const accounts = setupAccounts(setup.values);
  const full = oneOffs.length >= MAX_ONE_OFFS;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-extrabold">
          Coming up <span className="num text-muted">({oneOffs.length})</span>
        </h2>
        <p className="text-[13px] text-muted">
          <span className="num">{oneOffs.length}</span> of {MAX_ONE_OFFS}
        </p>
      </div>

      {oneOffs.length === 0 ? (
        <p className="rounded-[22px] border border-dashed border-border-strong p-7 text-center text-sm text-muted">
          Nothing added yet.
        </p>
      ) : (
        <div
          className={cn(
            stepCardClasses,
            isDesktop ? 'p-1.5' : 'overflow-hidden [&>*:first-child]:border-t-0'
          )}>
          {oneOffs.map(oneOff => (
            <SetupRow
              key={oneOff.id}
              name={oneOff.input.name}
              details={oneOffDetails(oneOff, { accounts, today })}
              amount={
                (oneOff.input.type === 'INCOME' ? '+' : isDesktop ? '' : MINUS) +
                formatMoney(oneOff.input.amount)
              }
              tone={oneOff.input.type === 'INCOME' ? 'income' : 'expense'}
              onOpen={() => setup.openPayment({ kind: 'oneOff', id: oneOff.id })}
              onRemove={() => setup.payment.remove(oneOff.id)}
            />
          ))}
        </div>
      )}

      <Button
        size="lg"
        disabled={full}
        onClick={() => setup.openPayment({ kind: 'oneOff' })}
        className={cn(
          'border-dashed border-border-strong font-bold',
          isDesktop ? 'self-start' : 'h-[52px] w-full'
        )}>
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Add a one-off payment
      </Button>
    </section>
  );
};
