import { useMemo, useState } from 'react';
import { Note, SortOption } from '~/types';

export const useFilterNotes = (notes?: Note[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created-desc');

  const filteredAndSortedNotes = useMemo(() => {
    return notes
      ?.filter(note => note.body?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const [field, direction] = sortBy.split('-');
        const getDate = (note: Note, field: string) => {
          const timestamp = field === 'updated' ? note.updatedAt || note.createdAt : note.createdAt;
          return timestamp ? new Date(parseInt(timestamp)) : new Date(0);
        };
        const dateA = getDate(a, field);
        const dateB = getDate(b, field);
        return direction === 'desc'
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
  }, [notes, searchQuery, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredAndSortedNotes
  };
};
