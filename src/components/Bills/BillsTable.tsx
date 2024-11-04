import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as PaidIcon,
  Cancel as UnpaidIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { Bill } from '~/types';
import { formatAmount } from '~/utils';

interface BillsTableProps {
  bills: Bill[];
  view: 'upcoming' | 'all';
  searchQuery: string;
}

export const BillsTable = ({ bills, view, searchQuery }: BillsTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = bills.map(bill => bill.id!);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesView = view === 'all' || !bill.paid;
    return matchesSearch && matchesView;
  });

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < bills.length}
                  checked={bills.length > 0 && selected.length === bills.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(bill => {
              const isItemSelected = isSelected(bill.id!);

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={bill.id}
                  selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isItemSelected} onChange={() => handleClick(bill.id!)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{bill.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Monthly
                    </Typography>
                  </TableCell>
                  <TableCell>£{formatAmount(bill.amount)}</TableCell>
                  <TableCell>15th of month</TableCell>
                  <TableCell>
                    <Chip label="Utilities" size="small" />
                  </TableCell>
                  <TableCell>
                    {bill.paid ? (
                      <Chip
                        icon={<PaidIcon sx={{ fontSize: '1rem !important' }} />}
                        label="Paid"
                        size="small"
                        color="success"
                      />
                    ) : (
                      <Chip
                        icon={<UnpaidIcon sx={{ fontSize: '1rem !important' }} />}
                        label="Unpaid"
                        size="small"
                        color="error"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredBills.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={event => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />
    </Box>
  );
};
