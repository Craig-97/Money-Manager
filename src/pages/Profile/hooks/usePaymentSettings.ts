import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { NonWorkingDay, UpdateBudgetDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { addDays, formatShortDate, parseIsoDate, toIsoDate } from '~/lib/dates';
import { REGIONS } from '~/lib/payday';
import {
  DEFAULT_NON_WORKING_DAY,
  goesOutOn,
  movedHow,
  NON_WORKING_DAY_LABELS,
  NON_WORKING_DAYS
} from '~/lib/payments';
import { showErrorToast, showToast } from '~/state/toast';

const OPTIONS = NON_WORKING_DAYS.map(rule => ({
  value: rule,
  label: NON_WORKING_DAY_LABELS[rule]
}));

// What each choice means, as the help under it starts
const HELP: Record<NonWorkingDay, string> = {
  NEXT: 'Payments that fall on a weekend or bank holiday go out the next working day, as most direct debits do.',
  BEFORE: 'Payments that fall on a weekend or bank holiday go out the working day before.',
  ON_DAY:
    'Payments go out on their dates, weekends and bank holidays included, as card payments can.'
};

/*
 * When payments on a weekend or bank holiday go out, for every recurring payment without its own
 * choice. It applies straight away to dates still to go out. Two examples show what it does: the
 * next Saturday and the next bank holiday.
 */
export const usePaymentSettings = (budget: Budget) => {
  const { today, holidays } = usePayCycle(budget.payday);
  const [updateBudget, { loading: saving }] = useMutation(UpdateBudgetDocument);
  const saved = budget.nonWorkingDay ?? DEFAULT_NON_WORKING_DAY;
  const [rule, setRule] = useState(saved);

  const saturday = addDays(today, (6 - today.getDay() + 7) % 7 || 7);
  const holiday = [...holidays]
    .filter(day => day > toIsoDate(today))
    .sort()
    .map(day => parseIsoDate(day)!)[0];
  const examples = [saturday, holiday]
    .filter(date => date !== undefined)
    .map(date => ({
      key: date.getTime(),
      due: `Due ${formatShortDate(date, today)}`,
      out: formatShortDate(goesOutOn(date, { rule, holidays }), today)
    }));

  const region = REGIONS.find(item => item.value === budget.payday?.bankHolidayRegion);

  const save = async () => {
    try {
      await updateBudget({ variables: { id: budget.id, input: { nonWorkingDay: rule } } });
      showToast({
        message:
          rule === 'ON_DAY'
            ? 'Payments now go out on their dates'
            : `Weekend payments now go out ${movedHow(rule)}`
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  return {
    rule,
    setRule,
    options: OPTIONS,
    help: HELP[rule],
    // Whose bank holidays count, from Payday
    regionText: region
      ? `Uses ${region.label} bank holidays, set under Payday.`
      : 'Choose your bank holidays under Payday; until then only weekends move payments.',
    examples,
    saving,
    isDirty: rule !== saved,
    save: () => void save()
  };
};
