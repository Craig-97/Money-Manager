import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { PaymentForm, PaymentRole } from '../../usePaymentForm';
import { DebtFields } from '../DebtFields';
import { MoveInto } from '../MoveInto';

const ROLES: { value: PaymentRole; label: string; hint: string }[] = [
  { value: 'payment', label: 'Payment', hint: 'A bill, subscription or money to someone else.' },
  { value: 'debt', label: 'Debt', hint: 'A loan or card. Shows on Debts with a payoff date.' },
  {
    value: 'move',
    label: 'Move money',
    hint: 'A standing order to one of your own accounts. Added there when it’s paid.'
  }
];

/*
 * What a recurring expense is, with each choice's own fields straight under it: the balance and
 * rate for a debt, the account for money moving. Move money only shows with an account to move to.
 */
export const RoleChoice = ({ form }: { form: PaymentForm }) => {
  const roles = form.choices.targets.length ? ROLES : ROLES.filter(role => role.value !== 'move');
  const current = roles.find(role => role.value === form.role) ?? roles[0];

  return (
    <>
      <div>
        <p id="payment-role" className="mb-2 text-[13px] font-bold text-muted">
          What is it?
        </p>
        <SegmentedControl
          aria-labelledby="payment-role"
          value={current.value}
          onValueChange={form.setRole}
          options={roles}
          size="lg"
          fullWidth
        />
        <p className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">{current.hint}</p>
      </div>
      {form.role === 'debt' ? <DebtFields form={form} /> : null}
      {form.role === 'move' ? <MoveInto form={form} /> : null}
    </>
  );
};
