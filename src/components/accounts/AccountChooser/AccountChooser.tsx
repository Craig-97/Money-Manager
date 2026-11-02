import { ChevronRight, PiggyBank, Wallet } from 'lucide-react';
import { AccountKind } from '~/graphql/generated';

const CHOICES = [
  {
    kind: 'SPENDING' as const,
    Icon: Wallet,
    title: 'Spending account',
    body: 'Bills and everyday spending. It counts in free to spend.'
  },
  {
    kind: 'SAVINGS' as const,
    Icon: PiggyBank,
    title: 'Savings account',
    body: 'Money you put aside, like an ISA. Kept out of free to spend unless you switch it on.'
  }
];

const choiceClasses =
  'flex min-h-[92px] w-full cursor-pointer items-center gap-4 rounded-3xl border border-border bg-surface-2 py-[18px] pr-[18px] pl-5 text-left transition-[translate,border-color,background-color] duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-hover max-md:min-h-20 max-md:gap-3.5 max-md:rounded-[22px] max-md:p-4';

/* "What kind of account is it?", like adding a payment, so the form has no type to choose */
export const AccountChooser = ({ onChoose }: { onChoose: (kind: AccountKind) => void }) => (
  <div className="flex flex-col gap-3 pb-1">
    <p className="mb-1.5 hidden text-sm font-medium text-muted md:block">
      What kind of account is it?
    </p>
    {CHOICES.map(({ kind, Icon, title, body }) => (
      <button key={kind} type="button" onClick={() => onChoose(kind)} className={choiceClasses}>
        <span className="inline-flex size-[52px] shrink-0 items-center justify-center rounded-[18px] bg-accent-soft text-accent-text max-md:size-12 max-md:rounded-2xl max-md:bg-accent max-md:text-on-accent">
          <Icon size={24} className="max-md:size-[22px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold tracking-[-0.01em]">{title}</span>
          <span className="mt-1 block text-[13px] font-medium text-muted">{body}</span>
        </span>
        <ChevronRight
          size={18}
          strokeWidth={2.25}
          className="shrink-0 text-muted"
          aria-hidden="true"
        />
      </button>
    ))}
  </div>
);
