import { Box, Typography } from '@mui/material';
import { ForecastTable, StandardPage } from '~/components';

export const Forecast = () => (
  <StandardPage>
    <Box sx={{ maxWidth: '1196px', m: '0 auto', p: 3 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
        Forecast
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          mb: { mobile: 11, md: 4 }
        }}>
        <ForecastTable past={true} />
        <ForecastTable />
      </Box>
    </Box>
  </StandardPage>
);
