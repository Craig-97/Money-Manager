import { AccountInterestInput, AccountKind, InterestFrequency } from '~/graphql/generated';
import { AccountInterest } from '~/lib/accounts';
import { parseIsoDate, toIsoDate } from '~/lib/dates';
import { parseMoney } from '~/lib/format';
import { LOGO_INVALID, logoIconUrl, readLogoInput } from '~/lib/icons';

/* An account's fields as typed, shared by the account dialog and setup */

const NAME_MAX = 50;
const PURPOSE_MAX = 60;

/* A savings account's interest as typed: its rate, how often it's paid, and when */
export interface InterestDraft {
  rate: string;
  // '' while it's not been said
  frequency: InterestFrequency | '';
  // The day of the month, for monthly
  day: string;
  // The next payment, for the others: 'YYYY-MM-DD'
  nextDate: string;
}

export interface AccountDraft {
  name: string;
  kind: AccountKind;
  balance: string;
  interest: InterestDraft;
  purpose: string;
  // The Logo box as typed: a website or an image's link; '' shows the letter
  logo: string;
  counts: boolean;
  paidInto: boolean;
}

export const EMPTY_INTEREST_DRAFT: InterestDraft = {
  rate: '',
  frequency: '',
  day: '',
  nextDate: ''
};

export const EMPTY_ACCOUNT_DRAFT: AccountDraft = {
  name: '',
  kind: 'SAVINGS',
  balance: '',
  interest: EMPTY_INTEREST_DRAFT,
  purpose: '',
  logo: '',
  counts: false,
  paidInto: false
};

/* A new account of the kind chosen: a spending account counts in free to spend, savings don't */
/* "Edit Joint bills", "Add account" while a kind is being chosen, "Add savings account" */
export const accountDialogTitle = (
  kind: AccountKind,
  { editing, choosing }: { editing: string | undefined; choosing: boolean }
) =>
  editing
    ? `Edit ${editing}`
    : choosing
      ? 'Add account'
      : `Add ${kind === 'SPENDING' ? 'spending' : 'savings'} account`;

export const blankDraft = (kind: AccountKind): AccountDraft => ({
  ...EMPTY_ACCOUNT_DRAFT,
  kind,
  counts: kind === 'SPENDING'
});

/* An account's interest as the form starts it */
export const interestDraftOf = (interest: AccountInterest | null): InterestDraft =>
  interest
    ? {
        rate: String(interest.rate),
        frequency: interest.frequency ?? '',
        day: interest.day && interest.frequency === 'MONTHLY' ? String(interest.day) : '',
        nextDate:
          interest.nextDate && interest.frequency !== 'MONTHLY' ? toIsoDate(interest.nextDate) : ''
      }
    : EMPTY_INTEREST_DRAFT;

const sameInterest = (a: InterestDraft, b: InterestDraft) =>
  a.rate.trim() === b.rate.trim() &&
  a.frequency === b.frequency &&
  a.day.trim() === b.day.trim() &&
  a.nextDate === b.nextDate;

/* A rate as typed: blank for none, otherwise a percentage from 0 to 100 */
const parseRate = (value: string) => {
  const cleaned = value.replace(/[%\s]/g, '');
  if (!cleaned) return { rate: null, valid: true };
  const rate = Number(cleaned);
  return { rate, valid: Number.isFinite(rate) && rate >= 0 && rate <= 100 };
};

export interface InterestDraftErrors {
  rate?: string;
  day?: string;
  nextDate?: string;
}

/*
 * What's wrong with interest as typed, and the interest as the API takes it: null for none. A rate
 * on its own is shown only; saying when it's paid needs a rate, a day for monthly and a date after
 * today for the others. Unchanged from `before`, a date that has since gone by is fine.
 */
export const checkInterestDraft = (
  draft: InterestDraft,
  { today, before }: { today: Date; before?: InterestDraft }
) => {
  const { rate, valid } = parseRate(draft.rate);
  const day = Number(draft.day.trim());
  const next = parseIsoDate(draft.nextDate);
  const unchanged = !!before && sameInterest(draft, before);
  const monthly = draft.frequency === 'MONTHLY';
  const errors: InterestDraftErrors = {
    rate: !valid
      ? 'Enter a rate from 0 to 100, like 4.5'
      : draft.frequency && rate === null
        ? 'Enter its rate'
        : undefined,
    day:
      monthly && !(Number.isInteger(day) && day >= 1 && day <= 31)
        ? 'Choose a day from 1 to 31'
        : undefined,
    nextDate:
      draft.frequency && !monthly && (!next || (!unchanged && next <= today))
        ? 'Choose a date after today'
        : undefined
  };
  const ok = Object.values(errors).every(error => !error);
  const input: AccountInterestInput | null =
    rate === null
      ? null
      : {
          rate,
          frequency: draft.frequency || null,
          ...(monthly ? { day } : {}),
          ...(draft.frequency && !monthly ? { nextDate: draft.nextDate } : {})
        };
  return { errors, valid: ok, input, unchanged };
};

export interface AccountDraftErrors extends InterestDraftErrors {
  balance?: string;
  name?: string;
  purpose?: string;
  logo?: string;
}

/*
 * What's wrong with a draft, once someone has tried to save it, and its fields as the API takes
 * them when nothing is. Spending accounts have no interest. Editing, interest goes only when it
 * changed, so a payment date that has gone by doesn't stop the rest saving.
 */
export const checkAccountDraft = (
  draft: AccountDraft,
  { submitted, today, before }: { submitted: boolean; today: Date; before?: InterestDraft }
) => {
  const name = draft.name.trim();
  const balance = parseMoney(draft.balance);
  const purpose = draft.purpose.trim();
  const spending = draft.kind === 'SPENDING';
  const interest = checkInterestDraft(draft.interest, { today, before });
  const logo = readLogoInput(draft.logo);
  const errors: AccountDraftErrors = {
    balance: balance === null ? 'Enter the balance, like 1,250.00' : undefined,
    name: !name
      ? 'Give it a name'
      : name.length > NAME_MAX
        ? `Keep it to ${NAME_MAX} characters`
        : undefined,
    ...(spending ? {} : interest.errors),
    purpose: purpose.length > PURPOSE_MAX ? `Keep it to ${PURPOSE_MAX} characters` : undefined,
    logo: logo.kind === 'invalid' ? LOGO_INVALID : undefined
  };
  const valid = Object.values(errors).every(error => !error);
  const common = { name, balance: balance!, counts: draft.counts, purpose: purpose || null };
  return {
    errors: submitted ? errors : {},
    fields:
      valid && balance !== null
        ? spending || interest.unchanged
          ? common
          : { ...common, interest: interest.input }
        : null,
    // Only the account dialog asks for a logo, so it's sent from there
    iconUrl: logoIconUrl(logo)
  };
};
