import { AccountKind } from '~/graphql/generated';
import { parseMoney } from '~/lib/format';

/* An account's fields as typed, shared by the account dialog and setup */

const NAME_MAX = 50;
const PURPOSE_MAX = 60;

export interface AccountDraft {
  name: string;
  kind: AccountKind;
  balance: string;
  interestRate: string;
  purpose: string;
  counts: boolean;
  paidInto: boolean;
}

export const EMPTY_ACCOUNT_DRAFT: AccountDraft = {
  name: '',
  kind: 'SAVINGS',
  balance: '',
  interestRate: '',
  purpose: '',
  counts: false,
  paidInto: false
};

/* A rate as typed: blank for none, otherwise a percentage from 0 to 100 */
const parseRate = (value: string) => {
  const cleaned = value.replace(/[%\s]/g, '');
  if (!cleaned) return { rate: null, valid: true };
  const rate = Number(cleaned);
  return { rate, valid: Number.isFinite(rate) && rate >= 0 && rate <= 100 };
};

export interface AccountDraftErrors {
  balance?: string;
  name?: string;
  interestRate?: string;
  purpose?: string;
}

/*
 * What's wrong with a draft, once someone has tried to save it, and its fields as the API takes
 * them when nothing is. Spending accounts always count and have no rate.
 */
export const checkAccountDraft = (draft: AccountDraft, { submitted }: { submitted: boolean }) => {
  const name = draft.name.trim();
  const balance = parseMoney(draft.balance);
  const { rate, valid: rateValid } = parseRate(draft.interestRate);
  const purpose = draft.purpose.trim();
  const errors: AccountDraftErrors = {
    balance: balance === null ? 'Enter the balance, like 1,250.00' : undefined,
    name: !name
      ? 'Give it a name'
      : name.length > NAME_MAX
        ? `Keep it to ${NAME_MAX} characters`
        : undefined,
    interestRate: rateValid ? undefined : 'Enter a rate from 0 to 100, like 4.5',
    purpose: purpose.length > PURPOSE_MAX ? `Keep it to ${PURPOSE_MAX} characters` : undefined
  };
  const valid = Object.values(errors).every(error => !error);
  const spending = draft.kind === 'SPENDING';
  return {
    errors: submitted ? errors : {},
    fields:
      valid && balance !== null
        ? spending
          ? { name, balance, purpose: purpose || null }
          : { name, balance, counts: draft.counts, interestRate: rate, purpose: purpose || null }
        : null
  };
};
