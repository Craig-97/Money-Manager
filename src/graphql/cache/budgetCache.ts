import { ApolloCache, Reference } from '@apollo/client';
import { ModifierDetails, Modifiers } from '@apollo/client/cache';
import {
  NoteFieldsFragment,
  NoteFieldsFragmentDoc,
  OneOffPaymentFieldsFragment,
  OneOffPaymentFieldsFragmentDoc,
  RecurringPaymentFieldsFragment,
  RecurringPaymentFieldsFragmentDoc,
  ReminderStateFieldsFragment,
  ReminderStateFieldsFragmentDoc
} from '~/graphql/generated';

// The budget's lists in the cache. Mutations that return an updated payment or note update it
// everywhere by themselves; creating or deleting one also has to change the budget's list.

type ListField = 'recurringPayments' | 'oneOffPayments' | 'notes';

const TYPENAMES: Record<ListField, string> = {
  recurringPayments: 'RecurringPayment',
  oneOffPayments: 'OneOffPayment',
  notes: 'Note'
};

const budgetId = (cache: ApolloCache, id: string) => cache.identify({ __typename: 'Budget', id });

const appendRef = (
  cache: ApolloCache,
  { budget, field, ref }: { budget: string; field: ListField; ref: Reference | undefined }
) => {
  if (!ref) return;
  cache.modify({
    id: budgetId(cache, budget),
    // The field is picked at runtime, which Apollo's typed modifiers can't follow
    fields: { [field]: (refs: readonly Reference[] = []) => [...refs, ref] } as Modifiers
  });
};

export const addRecurringPayment = (
  cache: ApolloCache,
  { budget, payment }: { budget: string; payment: RecurringPaymentFieldsFragment }
) =>
  appendRef(cache, {
    budget,
    field: 'recurringPayments',
    ref: cache.writeFragment({ fragment: RecurringPaymentFieldsFragmentDoc, data: payment })
  });

export const addOneOffPayment = (
  cache: ApolloCache,
  { budget, payment }: { budget: string; payment: OneOffPaymentFieldsFragment }
) =>
  appendRef(cache, {
    budget,
    field: 'oneOffPayments',
    ref: cache.writeFragment({ fragment: OneOffPaymentFieldsFragmentDoc, data: payment })
  });

export const addNote = (
  cache: ApolloCache,
  { budget, note }: { budget: string; note: NoteFieldsFragment }
) =>
  appendRef(cache, {
    budget,
    field: 'notes',
    ref: cache.writeFragment({ fragment: NoteFieldsFragmentDoc, data: note })
  });

/* Takes items off the budget's list and drops them from the cache */
export const removeFromBudget = (
  cache: ApolloCache,
  { budget, field, ids }: { budget: string; field: ListField; ids: readonly string[] }
) => {
  if (!ids.length) return;
  cache.modify({
    id: budgetId(cache, budget),
    fields: {
      [field]: (refs: readonly Reference[] = [], { readField }: ModifierDetails) =>
        refs.filter(ref => !ids.includes(readField<string>('id', ref) ?? ''))
    } as Modifiers
  });
  for (const id of ids) cache.evict({ id: cache.identify({ __typename: TYPENAMES[field], id }) });
  cache.gc();
};

/*
 * Puts reminder states the API sent back on the budget's list. A state already there is updated
 * by its key on its own; a new one is added.
 */
export const addReminderStates = (
  cache: ApolloCache,
  { budget, states }: { budget: string; states: readonly ReminderStateFieldsFragment[] }
) => {
  const refs = states.flatMap(state => {
    const ref = cache.writeFragment({ fragment: ReminderStateFieldsFragmentDoc, data: state });
    return ref ? [ref] : [];
  });
  cache.modify({
    id: budgetId(cache, budget),
    fields: {
      reminderStates: (existing: readonly Reference[] = []) => [
        ...existing,
        ...refs.filter(ref => !existing.some(item => item.__ref === ref.__ref))
      ]
    } as Modifiers
  });
};
