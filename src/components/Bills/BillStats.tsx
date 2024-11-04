import { Box, Card, Grid, Typography } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Bill } from '~/types';
import { formatAmount } from '~/utils';

interface BillsStatsProps {
  bills: Bill[];
}

export const BillsStats = ({ bills }: BillsStatsProps) => {
  const totalBills = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const paidBills = bills
    .filter(bill => bill.paid)
    .reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const unpaidBills = totalBills - paidBills;
  const upcomingCount = bills.filter(bill => !bill.paid).length;

  return (
    <Grid
      container
      columnSpacing={3}
      rowSpacing={3}
      sx={{ width: { mobile: 'calc(100svw - 24px)', sm: 'auto' } }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Total Monthly Bills
            </Typography>
          </Box>
          <Typography variant="h4">£{formatAmount(totalBills)}</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Paid This Month
            </Typography>
          </Box>
          <Typography variant="h4">£{formatAmount(paidBills)}</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingDownIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Remaining Balance
            </Typography>
          </Box>
          <Typography variant="h4">£{formatAmount(unpaidBills)}</Typography>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Upcoming Bills
            </Typography>
          </Box>
          <Typography variant="h4">{upcomingCount}</Typography>
        </Card>
      </Grid>
    </Grid>
  );
};
