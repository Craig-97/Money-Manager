import { Add, Search } from '@mui/icons-material';
import { Box, Button, InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import { SortOption } from '~/types';

interface NotesControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onAddNote: () => void;
}

export const NotesControls = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onAddNote
}: NotesControlsProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { mobile: 'column', sm: 'row' },
        justifyContent: { sm: 'space-between' },
        alignItems: { sm: 'center' },
        gap: { mobile: 3, sm: 0 },
        mb: 4
      }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search notes..."
          size="small"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          sx={{
            minWidth: { sm: 300 },
            flex: { mobile: 1, sm: 'unset' },
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '&:hover fieldset': {
                borderColor: 'primary.main'
              }
            },
            '& .MuiInputAdornment-root': {
              marginRight: 1,
              marginTop: '0'
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }
          }}
        />
        <Select
          size="small"
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortOption)}
          sx={{
            minWidth: 160,
            backgroundColor: 'background.paper',
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main'
              }
            }
          }}>
          <MenuItem value="created-desc">Newest</MenuItem>
          <MenuItem value="created-asc">Oldest</MenuItem>
          <MenuItem value="updated-desc">Last Updated Desc</MenuItem>
          <MenuItem value="updated-asc">Last Updated Asc</MenuItem>
        </Select>
      </Box>
      <Button
        variant="contained"
        onClick={onAddNote}
        sx={{
          height: '40px',
          p: '8px 16px',
          borderRadius: 1,
          gap: 1
        }}>
        <Add />
        <Box sx={{ display: { sm: 'block' } }}>Add Note</Box>
      </Button>
    </Box>
  );
};
