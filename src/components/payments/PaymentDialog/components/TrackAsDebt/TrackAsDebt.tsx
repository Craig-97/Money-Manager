import { Switch } from '~/components/ui/Switch';

interface TrackAsDebtProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/* The recurring form's switch for a payment that's paying off a loan or card */
export const TrackAsDebt = ({ checked, onCheckedChange }: TrackAsDebtProps) => (
  <div className="flex items-center gap-3 rounded-[18px] border border-border bg-surface-2 px-4 py-3.5">
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span id="payment-track-debt" className="text-sm font-bold">
        Track as a debt
      </span>
      <span id="payment-track-debt-hint" className="text-xs font-semibold text-muted">
        For loans and cards. Shows it on Debts with a payoff date
      </span>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-labelledby="payment-track-debt"
      aria-describedby="payment-track-debt-hint"
    />
  </div>
);
