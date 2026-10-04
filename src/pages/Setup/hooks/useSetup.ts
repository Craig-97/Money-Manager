import { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { AccountDocument, CreateAccountDocument, PayFrequency } from '~/graphql/generated';
import { useAuthStore } from '~/state/auth';
import {
  allowedRules,
  COMING_UP_STEP,
  INITIAL_VALUES,
  isStepValid,
  LAST_STEP,
  oneOffError,
  OneOffDraft,
  PRESETS,
  RegularDraft,
  SetupValues,
  toCreateAccountInput
} from '../setupModel';

let nextDraftId = 1;
const draftId = (prefix: string) => `${prefix}-${nextDraftId++}`;

/* Setup's answers, which step is showing, and saving it all as the account at the end */
export const useSetup = () => {
  const client = useApolloClient();
  const userId = useAuthStore(s => s.session?.userId ?? '');
  const [createAccount, { loading: saving, error: saveError, reset: clearSaveError }] =
    useMutation(CreateAccountDocument);

  const [values, setValues] = useState<SetupValues>(INITIAL_VALUES);
  const [step, setStep] = useState(0);
  // The furthest step reached, so the sidebar can go back to any step already seen
  const [maxStep, setMaxStep] = useState(0);
  // Errors only show once someone has tried to continue past them
  const [showErrors, setShowErrors] = useState(false);
  const [created, setCreated] = useState(false);
  const [finished, setFinished] = useState(false);

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

  const togglePreset = (key: string) =>
    setValues(current => {
      if (current.regulars.some(regular => regular.preset === key)) {
        return { ...current, regulars: current.regulars.filter(r => r.preset !== key) };
      }
      const preset = PRESETS.find(p => p.key === key)!;
      const regular: RegularDraft = {
        id: draftId('regular'),
        preset: key,
        name: preset.name,
        amount: '',
        frequency: 'MONTHLY',
        date: '',
        category: preset.category
      };
      return { ...current, regulars: [...current.regulars, regular] };
    });

  const addCustomRegular = () =>
    update('regulars', [
      ...values.regulars,
      {
        id: draftId('regular'),
        preset: null,
        name: '',
        amount: '',
        frequency: 'MONTHLY',
        date: '',
        category: 'OTHER'
      }
    ]);

  const updateRegular = (id: string, patch: Partial<RegularDraft>) =>
    setValues(current => ({
      ...current,
      regulars: current.regulars.map(regular =>
        regular.id === id ? { ...regular, ...patch } : regular
      )
    }));

  const removeRegular = (id: string) =>
    update(
      'regulars',
      values.regulars.filter(regular => regular.id !== id)
    );

  /* Adds a one-off payment, or returns why it can't be added */
  const addOneOff = (draft: Omit<OneOffDraft, 'id'>) => {
    const error = oneOffError(draft, values);
    if (error) return error;
    update('oneOffs', [
      ...values.oneOffs,
      { ...draft, name: draft.name.trim(), id: draftId('one-off') }
    ]);
    return undefined;
  };

  const removeOneOff = (id: string) =>
    update(
      'oneOffs',
      values.oneOffs.filter(oneOff => oneOff.id !== id)
    );

  const goTo = (target: number) => {
    if (target > maxStep || saving) return;
    setStep(target);
    setShowErrors(false);
    setFinished(false);
  };

  const finish = async () => {
    // Already saved, e.g. after going back to review: there's nothing more to save
    if (created) {
      setFinished(true);
      return;
    }
    clearSaveError();
    try {
      await createAccount({ variables: { account: toCreateAccountInput(values, userId) } });
      setCreated(true);
      setFinished(true);
    } catch {
      // saveError shows the problem; the answers stay as they were
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

  // Loading the new account lets the route guard take the person to their dashboard
  const goToDashboard = () => client.refetchQueries({ include: [AccountDocument] });

  return {
    values,
    update,
    setFrequency,
    togglePreset,
    addCustomRegular,
    updateRegular,
    removeRegular,
    addOneOff,
    removeOneOff,
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
