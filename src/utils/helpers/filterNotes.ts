import { Note, SortOption } from '~/types';

// Filters notes based on search query and sort options and returns sorted notes array
export const filterNotes = (notes: Note[] | undefined, searchQuery: string, sortBy: SortOption) => {
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
};
