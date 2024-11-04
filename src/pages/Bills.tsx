import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { StandardPage } from '~/components';
import { useAccountContext } from '~/state';
import { BillsStats, BillsTable, AddEditBillModal } from '~/components';

export const Bills = () => {
  const { account } = useAccountContext();
  const [view, setView] = useState<'upcoming' | 'all'>('upcoming');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewChange = (event: React.SyntheticEvent, newValue: 'upcoming' | 'all') => {
    setView(newValue);
  };

  return (
    <StandardPage>
      <Box sx={{ maxWidth: '1196px', m: '0 auto', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Bills
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ borderRadius: 2 }}>
            Add Bill
          </Button>
        </Box>

        <BillsStats bills={account.bills} />

        <Card sx={{ mt: 3, p: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={view} onChange={handleViewChange}>
              <Tab label="Upcoming" value="upcoming" />
              <Tab label="All Bills" value="all" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            <Tooltip title="Filter">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort">
              <IconButton>
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label="All Categories" onDelete={() => {}} />
            <Chip label="Status: All" onDelete={() => {}} />
          </Box>

          <BillsTable bills={account.bills} view={view} searchQuery={searchQuery} />
        </Card>

        <AddEditBillModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </Box>
    </StandardPage>
  );
};
