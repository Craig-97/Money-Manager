import { PiggyBank, Wallet } from 'lucide-react';
import { AccountKind } from '~/graphql/generated';
import { ChoiceList } from '../../ui';

const CHOICES = [
  {
    key: 'SPENDING' as const,
    Icon: Wallet,
    title: 'Spending account',
    body: 'Bills and everyday spending. It counts in free to spend.'
  },
  {
    key: 'SAVINGS' as const,
    Icon: PiggyBank,
    title: 'Savings account',
    body: 'Money you put aside, like an ISA. Kept out of free to spend unless you switch it on.'
  }
];

/* "What kind of account is it?", like adding a payment, so the form has no type to choose */
export const AccountChooser = ({ onChoose }: { onChoose: (kind: AccountKind) => void }) => (
  <ChoiceList prompt="What kind of account is it?" choices={CHOICES} onChoose={onChoose} />
);
