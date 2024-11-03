import { Box } from '@mui/material';
import { Panels, PaydayAlert, Totals, StandardPage } from '~/components';

export const Homepage = () => (
  <StandardPage>
    <Box sx={{ maxWidth: '1196px', m: '0 auto', p: 3 }}>
      <PaydayAlert />
      <Totals />
      <Panels />
    </Box>
  </StandardPage>
);
