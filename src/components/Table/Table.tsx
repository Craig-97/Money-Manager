import { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { Column, TableInstance, TableState, Row, Cell } from 'react-table';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { useMediaQuery, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import MaterialTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { TablePaginationActions } from './TablePaginationActions';

interface TableProps<T extends object> {
  columns: Array<Column<T>>;
  data: T[];
  stickyHeader?: boolean;
}

export const Table = <T extends object>({ columns, data, stickyHeader = true }: TableProps<T>) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

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
      initialState: { pageSize: 12 } as Partial<TableState<T>>
    },
    useSortBy,
    usePagination,
    useRowSelect
  ) as TableInstance<T> & {
    page: Row<T>[];
    gotoPage: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
    state: TableState<T> & { pageIndex: number; pageSize: number };
  };

  useEffect(() => {
    if (!isDesktop) {
      setPageSize(8);
    } else {
      setPageSize(12);
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
            <TableRow
              key={headerGroup.getHeaderGroupProps().key}
              {...(({ key, ...rest }) => rest)(headerGroup.getHeaderGroupProps())}>
              {headerGroup.headers.map(column => (
                <TableCell
                  key={column.getHeaderProps().key}
                  {...(({ key, ...rest }) => rest)(column.getHeaderProps())}>
                  {column.render('Header')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {page.map((row: Row<T>) => {
            prepareRow(row);
            return (
              <TableRow
                key={row.getRowProps().key}
                {...(({ key, ...rest }) => rest)(row.getRowProps())}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {row.cells.map((cell: Cell<T>) => {
                  return (
                    <TableCell
                      key={cell.getCellProps().key}
                      {...(({ key, ...rest }) => rest)(cell.getCellProps())}>
                      {cell.render('Cell')}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[8, 12, 16, { label: 'All', value: data.length }]}
              colSpan={0}
              count={data.length}
              rowsPerPage={pageSize}
              page={pageIndex}
              slotProps={{
                select: {
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true
                }
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
