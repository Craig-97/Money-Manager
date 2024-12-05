import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useAccountStore } from '~/state';

interface SpendingImpactChartProps {
  customMonthlySpend: number;
}

export const SpendingImpactChart = ({ customMonthlySpend }: SpendingImpactChartProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const billsTotal = useAccountStore(state => state.account.billsTotal || 0);

  const getComparisonData = () => {
    const defaultSpend = billsTotal || 0;
    const difference = defaultSpend - customMonthlySpend;

    return Array.from({ length: 6 }, (_, i) => ({
      month: (i + 1).toString(),
      fullMonth: `Month ${i + 1}`,
      amount: difference * (i + 1)
    }));
  };

  const isPositiveImpact = customMonthlySpend <= (billsTotal || 0);
  const monthlyDifference = Math.abs((billsTotal || 0) - customMonthlySpend).toFixed(2);
  const impactColor = isPositiveImpact ? theme.palette.success.main : theme.palette.error.main;

  const difference = billsTotal - customMonthlySpend;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="body1" color="text.secondary" fontWeight={700} gutterBottom>
        Impact compared to current monthly bills
      </Typography>

      <Box sx={{ height: isDesktop ? 300 : 200, mt: 2, position: 'relative' }}>
        <ResponsiveContainer>
          <LineChart
            data={getComparisonData()}
            margin={{ top: 5, right: 10, bottom: 0, left: -30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.75} />
            <XAxis
              dataKey="month"
              stroke={theme.palette.text.secondary}
              fontSize="0.875rem"
              fontFamily={theme.typography.fontFamily}
            />
            <YAxis
              stroke={theme.palette.text.secondary}
              fontSize="0.875rem"
              tickFormatter={value => `£${Math.abs(value)}`}
              fontFamily={theme.typography.fontFamily}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius,
                fontFamily: theme.typography.fontFamily,
                fontSize: '0.875rem',
                padding: '8px 12px'
              }}
              formatter={(value: number) => {
                const label = value >= 0 ? 'Savings' : 'Loss';
                return [`£${Math.abs(value)}`, label];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `Month ${label}`;
                }
                return label;
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={impactColor}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: theme.palette.background.paper,
                stroke: impactColor
              }}
              activeDot={{
                r: 6,
                fill: impactColor,
                stroke: theme.palette.background.paper,
                strokeWidth: 2
              }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>

        {difference === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '90%',
              padding: 2,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'linear-gradient(145deg, #1E1B2A, #2a2840)',
              borderRadius: theme.shape.borderRadius,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Adjust the monthly spend to see how it compares to your current bills
            </Typography>
          </Box>
        )}
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={500}
        fontSize="0.875rem"
        sx={{ mt: 2, textAlign: 'center', opacity: 0.5 }}>
        {isPositiveImpact
          ? `You could save £${monthlyDifference} per month`
          : `You would spend £${monthlyDifference} more per month`}
      </Typography>
    </Box>
  );
};
