import { useShallow } from 'zustand/react/shallow';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Box } from '@mui/material';
import { formatShortDate } from '~/utils/date/dates';
import { calculateProjections } from '~/utils/financial/forecast';
import { ForecastCard } from './ForecastCard';
import { useGetPayday } from '~/hooks';
import { useAccountStore } from '~/state';

const iconStyles = {
  fontSize: '2.8rem',
  ml: -2,
  mt: 1.5,
  opacity: 0.9
};

interface ForecastCardsProps {
  customMonthlySpend?: number;
}

export const ForecastCards = ({ customMonthlySpend }: ForecastCardsProps) => {
  const { paydayInfo } = useGetPayday();
  const { payday } = paydayInfo;

  const [bankFreeToSpend = 0, monthlyIncome = 0, bankPaydayBalance = 0, billsTotal = 0] =
    useAccountStore(
      useShallow(s => [
        s.account.bankFreeToSpend,
        s.account.monthlyIncome,
        s.account.bankPaydayBalance,
        s.account.billsTotal
      ])
    );

  const { oneYearProjection, monthlyGrowth, oneYearGrowth } = calculateProjections({
    bankFreeToSpend,
    bankPaydayBalance,
    monthlyIncome,
    monthlySpend: customMonthlySpend ?? billsTotal ?? 0
  });

  const monthlyGrowthNum = parseFloat(monthlyGrowth);
  const oneYearGrowthNum = parseFloat(oneYearGrowth);
  const formattedPayday = payday ? formatShortDate(payday) : '';

  // Determine colors based on growth values
  const growthColor = monthlyGrowthNum >= 0 ? 'success' : 'error';
  const projectionColor = oneYearGrowthNum >= 0 ? 'success' : 'error';

  // Format growth values with correct sign
  const formattedMonthlyGrowth = `${monthlyGrowthNum >= 0 ? '+' : ''}${monthlyGrowthNum}%`;
  const formattedYearGrowth = `${oneYearGrowthNum >= 0 ? '+' : ''}${oneYearGrowthNum}%`;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 4,
        mb: 4
      }}>
      <ForecastCard
        title="BANK BALANCE"
        value={`£${bankFreeToSpend}`}
        subtitle="BEFORE PAYDAY"
        icon={<AccountBalanceWalletOutlinedIcon sx={{ ...iconStyles, color: 'primary.main' }} />}
        circleColor="primary"
      />

      <ForecastCard
        title="PAYDAY BALANCE"
        value={`£${bankPaydayBalance}`}
        subtitle={`ON ${formattedPayday}`}
        icon={<CalendarTodayOutlinedIcon sx={{ ...iconStyles, color: 'primary.main' }} />}
        circleColor="primary"
      />

      <ForecastCard
        title="MONTHLY GROWTH"
        value={formattedMonthlyGrowth}
        subtitle="AVG MONTHLY INCREASE"
        icon={
          monthlyGrowthNum >= 0 ? (
            <TrendingUpOutlinedIcon sx={{ ...iconStyles, color: `${growthColor}.main` }} />
          ) : (
            <TrendingDownOutlinedIcon sx={{ ...iconStyles, color: `${growthColor}.main` }} />
          )
        }
        circleColor={growthColor}
        valueColor={growthColor}
      />

      <ForecastCard
        title="ONE YEAR PROJECTION"
        value={`£${oneYearProjection}`}
        subtitle={`${formattedYearGrowth} FROM CURRENT`}
        icon={
          oneYearGrowthNum >= 0 ? (
            <ShowChartOutlinedIcon sx={{ ...iconStyles, color: `${projectionColor}.main` }} />
          ) : (
            <TrendingDownOutlinedIcon sx={{ ...iconStyles, color: `${projectionColor}.main` }} />
          )
        }
        circleColor={projectionColor}
        valueColor={projectionColor}
      />
    </Box>
  );
};
