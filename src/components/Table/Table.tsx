import Paper from '@mui/material/Paper';
import MaterialTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useTable, Column } from 'react-table';

interface TableProps {
  columns: Array<Column<object>>;
  data: Array<object>;
  stickyHeader?: boolean;
}

export const Table = ({ columns, data, stickyHeader = true }: TableProps) => {
  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });

  return (
    <TableContainer component={Paper}>
      <MaterialTable stickyHeader={stickyHeader} {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {rows.map(row => {
            prepareRow(row);
            return (
              <TableRow
                {...row.getRowProps()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {row.cells.map(cell => {
                  return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </MaterialTable>
    </TableContainer>
  );
};
