import { ChangeEvent, ReactNode, SyntheticEvent, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TablePagination,
  useTheme,
  useMediaQuery,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { calculateForecastData, getMonthsList } from '~/utils/financial/forecast';
import { useAccountStore } from '~/state';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`projection-tabpanel-${index}`}
      aria-labelledby={`projection-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

interface MonthlyProjectionProps {
  customMonthlySpend: number;
}

export const MonthlyProjection = ({ customMonthlySpend }: MonthlyProjectionProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const [bankFreeToSpend = 0, monthlyIncome = 0] = useAccountStore(
    useShallow(s => [s.account.bankFreeToSpend, s.account.monthlyIncome])
  );

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const months = getMonthsList();
  const monthlyNet = monthlyIncome - customMonthlySpend;

  const data = calculateForecastData({
    months,
    initialBalance: bankFreeToSpend,
    monthlyIncome,
    monthlyNet,
    past: tabIndex === 0
  });

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const tableStyles = {
    '& .MuiTableCell-head': {
      fontWeight: 700,
      fontSize: '1rem',
      color: theme.palette.text.primary
    },
    '& .MuiTableCell-body': {
      fontSize: '0.95rem',
      py: 2
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Balance Projection
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 3 }}>
            Monthly balance forecast based on configured spend
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                color: 'text.secondary',
                fontSize: '0.95rem',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}>
            <Tab label="Before Payday" />
            <Tab label="After Payday" />
          </Tabs>

          <TabPanel value={tabIndex} index={0}>
            <TableContainer>
              <Table size="medium" sx={tableStyles}>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                        {row.month}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {row.amount}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            parseFloat(row.percentageChange || '0') >= 0
                              ? 'success.main'
                              : 'error.main',
                          fontWeight: 500
                        }}>
                        {row.percentageChange ? (
                          <>
                            {parseFloat(row.percentageChange) > 0 ? '+' : ''}
                            {row.percentageChange}%
                          </>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[6, 12, 24]}
              labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
              sx={{
                '.MuiTablePagination-select': {
                  fontSize: '0.95rem'
                },
                '.MuiTablePagination-displayedRows': {
                  fontSize: '0.95rem'
                }
              }}
            />
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <TableContainer>
              <Table size="medium" sx={tableStyles}>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Change</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                        {row.month}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {row.amount}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            parseFloat(row.percentageChange || '0') >= 0
                              ? 'success.main'
                              : 'error.main',
                          fontWeight: 500
                        }}>
                        {row.percentageChange ? (
                          <>
                            {parseFloat(row.percentageChange) > 0 ? '+' : ''}
                            {row.percentageChange}%
                          </>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[6, 12, 24]}
              labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
              sx={{
                '.MuiTablePagination-select': {
                  fontSize: '0.95rem'
                },
                '.MuiTablePagination-displayedRows': {
                  fontSize: '0.95rem',
                  margin: 0
                }
              }}
            />
          </TabPanel>
        </Box>
      </CardContent>
    </Card>
  );
};
