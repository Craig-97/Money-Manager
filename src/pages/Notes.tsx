import { Box, Typography } from '@mui/material';
import { NewNoteCard, NoteCard, StandardPage } from '~/components';
import { useAccountStore } from '~/state';
import { Note } from '~/types';

export const Notes = () => {
  const notes = useAccountStore(s => s.account.notes);

  return (
    <StandardPage>
      <Box sx={{ maxWidth: '1196px', m: '0 auto', p: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Notes
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            mb: { mobile: 11, sm: 4 }
          }}>
          <NewNoteCard />
          {notes?.map(({ id, ...rest }: Note) => {
            return <NoteCard key={id} id={id} {...rest} />;
          })}
        </Box>
      </Box>
    </StandardPage>
  );
};
