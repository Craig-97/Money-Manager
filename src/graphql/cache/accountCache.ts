import { ApolloCache, Reference } from '@apollo/client';
import { ModifierDetails, Modifiers } from '@apollo/client/cache';
import {
  NoteFieldsFragment,
  NoteFieldsFragmentDoc,
  OneOffPaymentFieldsFragment,
  OneOffPaymentFieldsFragmentDoc,
  RecurringPaymentFieldsFragment,
  RecurringPaymentFieldsFragmentDoc
} from '~/graphql/generated';

// The account's lists in the cache. Mutations that return an updated payment or note update it
// everywhere by themselves; creating or deleting one also has to change the account's list.

type ListField = 'recurringPayments' | 'oneOffPayments' | 'notes';

const TYPENAMES: Record<ListField, string> = {
  recurringPayments: 'RecurringPayment',
  oneOffPayments: 'OneOffPayment',
  notes: 'Note'
};

const accountId = (cache: ApolloCache, id: string) => cache.identify({ __typename: 'Account', id });

const appendRef = (
  cache: ApolloCache,
  account: string,
  field: ListField,
  ref: Reference | undefined
) => {
  if (!ref) return;
  cache.modify({
    id: accountId(cache, account),
    // The field is picked at runtime, which Apollo's typed modifiers can't follow
    fields: { [field]: (refs: readonly Reference[] = []) => [...refs, ref] } as Modifiers
  });
};

export const addRecurringPayment = (
  cache: ApolloCache,
  account: string,
  payment: RecurringPaymentFieldsFragment
) =>
  appendRef(
    cache,
    account,
    'recurringPayments',
    cache.writeFragment({ fragment: RecurringPaymentFieldsFragmentDoc, data: payment })
  );

export const addOneOffPayment = (
  cache: ApolloCache,
  account: string,
  payment: OneOffPaymentFieldsFragment
) =>
  appendRef(
    cache,
    account,
    'oneOffPayments',
    cache.writeFragment({ fragment: OneOffPaymentFieldsFragmentDoc, data: payment })
  );

export const addNote = (cache: ApolloCache, account: string, note: NoteFieldsFragment) =>
  appendRef(
    cache,
    account,
    'notes',
    cache.writeFragment({ fragment: NoteFieldsFragmentDoc, data: note })
  );

/* Takes items off the account's list and drops them from the cache */
export const removeFromAccount = (
  cache: ApolloCache,
  account: string,
  field: ListField,
  ids: readonly string[]
) => {
  if (!ids.length) return;
  cache.modify({
    id: accountId(cache, account),
    fields: {
      [field]: (refs: readonly Reference[] = [], { readField }: ModifierDetails) =>
        refs.filter(ref => !ids.includes(readField<string>('id', ref) ?? ''))
    } as Modifiers
  });
  for (const id of ids) cache.evict({ id: cache.identify({ __typename: TYPENAMES[field], id }) });
  cache.gc();
};
