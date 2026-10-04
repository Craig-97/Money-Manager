import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { EditPaydayDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { useBankHolidays } from '~/hooks/useBankHolidays';
import { startOfToday } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { showToast } from '~/state/toast';
import {
  paydayErrors,
  paydayPreview,
  PaydayValues,
  toPaydayConfig,
  toPaydayInput,
  toPaydayValues,
  withFrequency
} from '../profileModel';

/* The payday form, with the next few paydays it gives updating as it changes */
export const usePaydaySettings = (account: Account) => {
  const [editPayday, { loading: saving }] = useMutation(EditPaydayDocument);
  const [values, setValues] = useState(() => toPaydayValues(account.payday));
  const [submitted, setSubmitted] = useState(false);
  // What was last saved, so the form knows when it has changed
  const [saved, setSaved] = useState(values);
  const holidays = useBankHolidays(values.region);

  const errors = paydayErrors(values);
  const valid = !errors.dayOfMonth && !errors.firstPayDate;
  const today = startOfToday();

  const preview = valid ? paydayPreview(toPaydayConfig(values), holidays, today) : [];

  const save = async () => {
    setSubmitted(true);
    if (!valid || !account.payday) return;
    try {
      await editPayday({ variables: { id: account.payday.id, payday: toPaydayInput(values) } });
      setSubmitted(false);
      setSaved(values);
      showToast({ message: 'Payday settings saved' });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't save your payday. Try again.") });
    }
  };

  return {
    values,
    update: <K extends keyof PaydayValues>(key: K, value: PaydayValues[K]) =>
      setValues(current => ({ ...current, [key]: value })),
    setFrequency: (frequency: PaydayValues['frequency']) =>
      setValues(current => withFrequency(current, frequency)),
    // Errors show once they've tried to save
    errors: submitted ? errors : {},
    preview,
    saving,
    isDirty: (Object.keys(values) as (keyof PaydayValues)[]).some(
      key => values[key] !== saved[key]
    ),
    save: () => void save()
  };
};

export type PaydaySettings = ReturnType<typeof usePaydaySettings>;
