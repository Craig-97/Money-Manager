import { PaymentForm } from '../../usePaymentForm';
import { ScheduleSummary } from '../ScheduleSummary';

/*
 * In place of Ends for a debt: it ends when it's paid off, worked out from the balance and APR in
 * the debt card. Then the schedule summary, with the payoff date.
 */
export const DebtEnding = ({ form }: { form: PaymentForm }) => (
  <>
    <div>
      <p className="mb-2 text-[13px] font-bold text-muted">Ends</p>
      <p className="flex min-h-12 items-center rounded-2xl border border-border bg-surface-2 px-4 text-sm font-bold">
        When it&rsquo;s paid off
      </p>
      <p className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">
        Worked out from the balance and APR above. Nothing is due once it reaches £0.
      </p>
    </div>

    <ScheduleSummary rows={form.summary.rows} message={form.summary.message} />
  </>
);
