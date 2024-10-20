import Paper from '@mui/material/Paper';
import MaterialTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { ChangeEvent, useEffect } from 'react';
import { Column, usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { useIsDesktop } from '~/hooks';
import { TablePaginationActions } from './TablePaginationActions';

interface TableProps {
  columns: Array<Column<object>>;
  data: Array<object>;
  stickyHeader?: boolean;
}

export const Table = ({ columns, data, stickyHeader = true }: TableProps) => {
  const isDesktop = useIsDesktop();

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 16 }
    },
    useSortBy,
    usePagination,
    useRowSelect
  );

  useEffect(() => {
    if (!isDesktop) {
      setPageSize(8);
    } else {
      setPageSize(16);
    }
  }, [isDesktop, setPageSize]);

  const handleChangePage = (event: unknown, newPage: number) => {
    gotoPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
  };

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
          {page.map(row => {
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
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[8, 16, { label: 'All', value: data.length }]}
              colSpan={0}
              count={data.length}
              rowsPerPage={pageSize}
              page={pageIndex}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </MaterialTable>
    </TableContainer>
  );
};
