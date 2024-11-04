import { ApolloCache, InMemoryCache } from '@apollo/client';
import { getAccountCache, updateAccountCache } from './AccountCache';
import { Note, User } from '~/types';

/* Adds new note to current note array */
export const addNoteCache = (cache: ApolloCache<InMemoryCache>, note: Note, user: User) => {
  const { account } = getAccountCache(cache, user) || {};

  if (account?.notes) {
    const notes = [...(account.notes || []), note];
    updateAccountCache(cache, { account: { ...account, ...{ notes } } });
  }
};

/* Removes note from current notes array */
export const deleteNoteCache = (cache: ApolloCache<InMemoryCache>, note: Note, user: User) => {
  const { account } = getAccountCache(cache, user) || {};

  if (account?.notes && note.id) {
    const notes = account?.notes?.filter((n: Note) => n.id !== note.id);
    updateAccountCache(cache, { account: { ...account, ...{ notes } } });
  }
};
