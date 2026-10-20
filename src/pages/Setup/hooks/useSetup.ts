import { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { AccountDraft } from '~/components/accounts';
import { DraftPayment } from '~/components/payments/PaymentDialog';
import { ERRORS } from '~/constants';
import { linkBudget } from '~/graphql/cache';
import {
  BudgetFieldsFragment,
  CreateBudgetDocument,
  CurrentUserDocument,
  PayFrequency
} from '~/graphql/generated';
import { hasErrorCode } from '~/lib/errors';
import { useAuthStore } from '~/state/auth';
import {
  allowedRules,
  COMING_UP_STEP,
  INITIAL_VALUES,
  isStepValid,
  LAST_STEP,
  PAID_INTO_KEY,
  paymentProblem,
  PRESETS,
  SetupValues,
  toCreateBudgetInput
} from '../setupModel';

let nextDraftId = 1;
const draftId = (prefix: string) => `${prefix}-${nextDraftId++}`;

// The payment dialog: adding one (from a suggestion, or blank) or changing one in the list
export type SetupPaymentTarget =
  { kind: 'recurring'; id?: string; preset?: string } | { kind: 'oneOff'; id?: string };

/* Setup's answers, which step is showing, and saving it all as the budget at the end */
export const useSetup = () => {
  const client = useApolloClient();
  const userId = useAuthStore(s => s.session?.userId);
  const [createBudget, { loading: saving, error: saveError, reset: clearSaveError }] =
    useMutation(CreateBudgetDocument);

  const [values, setValues] = useState<SetupValues>(INITIAL_VALUES);
  const [step, setStep] = useState(0);
  // The furthest step reached, so the sidebar can go back to any step already seen
  const [maxStep, setMaxStep] = useState(0);
  // Errors only show once someone has tried to continue past them
  const [showErrors, setShowErrors] = useState(false);
  // Set once saved; the person stays in setup until they choose to go to the dashboard
  const [budget, setBudget] = useState<BudgetFieldsFragment | null>(null);
  const [finished, setFinished] = useState(false);
  // The dialogs' targets, kept while they animate closed; each opening counts up for a fresh form
  const [paymentTarget, setPaymentTarget] = useState<SetupPaymentTarget>({ kind: 'recurring' });
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [accountKey, setAccountKey] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [opened, setOpened] = useState(0);

  const update = <K extends keyof SetupValues>(key: K, value: SetupValues[K]) =>
    setValues(current => ({ ...current, [key]: value }));

  const setFrequency = (frequency: PayFrequency) =>
    setValues(current => {
      const rules = allowedRules(frequency);
      return {
        ...current,
        frequency,
        rule: rules.includes(current.rule) ? current.rule : rules[0]
      };
    });

  const presetKey = paymentTarget.kind === 'recurring' ? paymentTarget.preset : undefined;

  const openPayment = (target: SetupPaymentTarget) => {
    setPaymentTarget(target);
    setPaymentOpen(true);
    setOpened(count => count + 1);
  };

  // A suggestion already added opens that payment; otherwise the form starts with its name
  const openPreset = (key: string) => {
    const added = values.regulars.find(regular => regular.preset === key);
    openPayment(added ? { kind: 'recurring', id: added.id } : { kind: 'recurring', preset: key });
  };

  /* Adds or replaces a payment from the dialog, or says why it can't */
  const savePayment = (draft: DraftPayment) => {
    const { id } = paymentTarget;
    const problem = paymentProblem(values, {
      name: draft.input.name,
      id,
      oneOff: draft.kind === 'oneOff'
    });
    if (problem) return problem;
    setValues(current => {
      if (draft.kind === 'recurring') {
        const preset = paymentTarget.kind === 'recurring' ? (paymentTarget.preset ?? null) : null;
        const regulars = id
          ? current.regulars.map(regular =>
              regular.id === id ? { ...regular, input: draft.input } : regular
            )
          : [...current.regulars, { id: draftId('regular'), preset, input: draft.input }];
        return { ...current, regulars };
      }
      const oneOffs = id
        ? current.oneOffs.map(oneOff =>
            oneOff.id === id ? { ...oneOff, input: draft.input } : oneOff
          )
        : [...current.oneOffs, { id: draftId('one-off'), input: draft.input }];
      return { ...current, oneOffs };
    });
    return undefined;
  };

  const removePayment = (id: string) => {
    setValues(current => ({
      ...current,
      regulars: current.regulars.filter(regular => regular.id !== id),
      oneOffs: current.oneOffs.filter(oneOff => oneOff.id !== id)
    }));
    setPaymentOpen(false);
  };

  const openAccount = (key: string | null) => {
    setAccountKey(key);
    setAccountOpen(true);
    setOpened(count => count + 1);
  };

  const saveAccount = (draft: AccountDraft) => {
    setValues(current => ({
      ...current,
      accounts: accountKey
        ? current.accounts.map(account =>
            account.key === accountKey ? { ...account, draft } : account
          )
        : [...current.accounts, { key: draftId('account'), draft }]
    }));
    setAccountOpen(false);
  };

  // Payments that used it go back to where pay lands, and ones moving money into it stop
  const removeAccount = (key: string) => {
    setValues(current => ({
      ...current,
      accounts: current.accounts.filter(account => account.key !== key),
      regulars: current.regulars.map(regular => ({
        ...regular,
        input: {
          ...regular.input,
          account: regular.input.account === key ? null : regular.input.account,
          paysInto: regular.input.paysInto === key ? null : regular.input.paysInto
        }
      })),
      oneOffs: current.oneOffs.map(oneOff => ({
        ...oneOff,
        input: {
          ...oneOff.input,
          account: oneOff.input.account === key ? null : oneOff.input.account
        }
      }))
    }));
    setAccountOpen(false);
  };

  const goTo = (target: number) => {
    if (target > maxStep || saving) return;
    setStep(target);
    setShowErrors(false);
    setFinished(false);
  };

  const finish = async () => {
    // Already saved, e.g. after going back to review: there's nothing more to save
    if (budget) {
      setFinished(true);
      return;
    }
    clearSaveError();
    try {
      const { data } = await createBudget({ variables: { input: toCreateBudgetInput(values) } });
      setBudget(data?.createBudget.budget ?? null);
      setFinished(true);
    } catch (error) {
      // Setup was finished on another device. Loading the user again shows they have a budget,
      // and the route guard takes them to it. If that fails too, Try again repeats both.
      if (hasErrorCode(error, ERRORS.BUDGET_EXISTS)) {
        await client
          .query({ query: CurrentUserDocument, fetchPolicy: 'network-only' })
          .catch(() => undefined);
      }
      // saveError shows the problem meanwhile; the answers stay as they were
    }
  };

  const next = () => {
    if (!isStepValid(step, values)) {
      setShowErrors(true);
      return;
    }
    if (step === LAST_STEP) {
      void finish();
      return;
    }
    setStep(step + 1);
    setMaxStep(Math.max(maxStep, step + 1));
    setShowErrors(false);
  };

  const back = () => {
    setStep(Math.max(0, step - 1));
    setShowErrors(false);
  };

  // "Skip for now" on the coming up step goes straight to the review
  const skip = () => {
    setStep(LAST_STEP);
    setMaxStep(LAST_STEP);
    setShowErrors(false);
  };

  // Linking the new budget to the user lets the route guard take the person to their dashboard
  const goToDashboard = () => {
    if (budget && userId) linkBudget(client.cache, { userId, budget });
  };

  return {
    values,
    update,
    setFrequency,
    payment: {
      target: paymentTarget,
      open: paymentOpen,
      opened,
      // The suggestion it was opened from, for the name and category to start with
      preset: PRESETS.find(preset => preset.key === presetKey) ?? null,
      close: () => setPaymentOpen(false),
      save: savePayment,
      remove: removePayment
    },
    openPreset,
    openPayment,
    account: {
      key: accountKey,
      open: accountOpen,
      opened,
      close: () => setAccountOpen(false),
      save: saveAccount,
      remove: removeAccount
    },
    openAccount,
    paidIntoKey: PAID_INTO_KEY,
    step,
    maxStep,
    showErrors,
    canSkip: step === COMING_UP_STEP,
    next,
    back,
    skip,
    goTo,
    saving,
    saveFailed: !!saveError,
    retry: () => void finish(),
    finished,
    reopen: () => setFinished(false),
    goToDashboard
  };
};

export type SetupState = ReturnType<typeof useSetup>;
