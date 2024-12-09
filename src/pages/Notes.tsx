import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { NewNoteCard, NoteCard, NotesControls, StandardPage } from '~/components';
import { useAccountStore } from '~/state';
import { SortOption } from '~/types';
import { filterNotes } from '~/utils';

export const Notes = () => {
  const notes = useAccountStore(s => s.account.notes);
  const [showNewNote, setShowNewNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created-desc');

  const filteredAndSortedNotes = filterNotes(notes, searchQuery, sortBy);

  return (
    <StandardPage>
      <Box sx={{ m: '0 auto', p: { mobile: 3, sm: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Notes
          </Typography>
          <Typography variant="body1" fontWeight={500} color="text.secondary">
            Keep track of important notes and reminders
          </Typography>
        </Box>

        <NotesControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onAddNote={() => setShowNewNote(true)}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              mobile: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: { mobile: 11, sm: 4 }
          }}>
          {showNewNote && <NewNoteCard onSave={() => setShowNewNote(false)} />}
          {filteredAndSortedNotes?.map(({ id, ...rest }, index) => (
            <NoteCard key={id} id={id} index={index} {...rest} />
          ))}
        </Box>
      </Box>
    </StandardPage>
  );
};
