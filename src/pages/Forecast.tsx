import { useState, useEffect, ChangeEvent } from 'react';
import { Box, Card, CardContent, Typography, TextField, InputAdornment } from '@mui/material';
import { ForecastCards, StandardPage, MonthlyProjection, SpendingImpactChart } from '~/components';
import { useAccountStore } from '~/state';

export const Forecast = () => {
  const billsTotal = useAccountStore(state => state.account.billsTotal);
  const [monthlySpend, setMonthlySpend] = useState('0');

  // Update monthlySpend when billsTotal becomes available
  useEffect(() => {
    if (billsTotal) setMonthlySpend(billsTotal.toString());
  }, [billsTotal]);

  const handleSpendChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setMonthlySpend(value);
  };

  return (
    <StandardPage>
      <Box sx={{ m: '0 auto', p: { mobile: 3, sm: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Balance Forecast
          </Typography>
          <Typography variant="body1" fontWeight={500} color="text.secondary">
            Your projected bank balance for the next year
          </Typography>
        </Box>

        <ForecastCards customMonthlySpend={Number(monthlySpend)} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' },
            gap: 4,
            mb: { mobile: 11, md: 4 }
          }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Details
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                Configure your monthly spend
              </Typography>

              <TextField
                fullWidth
                value={monthlySpend}
                onChange={handleSpendChange}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">£</InputAdornment>
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 2,
                  opacity: 0.7,
                  fontSize: '0.875rem',
                  mb: 4
                }}>
                Default value is based on your total monthly bills
              </Typography>

              <Box
                sx={{
                  height: '1px',
                  bgcolor: 'divider'
                }}
              />

              <SpendingImpactChart customMonthlySpend={Number(monthlySpend)} />
            </CardContent>
          </Card>

          <MonthlyProjection customMonthlySpend={Number(monthlySpend)} />
        </Box>
      </Box>
    </StandardPage>
  );
};
