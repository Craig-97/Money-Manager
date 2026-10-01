import { Box } from '@mui/material';
import { Panels, PaydayAlert, Totals, StandardPage } from '~/components';

export const Homepage = () => (
  <StandardPage>
    <Box sx={{ m: '0 auto', p: { mobile: 3, sm: 4 } }}>
      <PaydayAlert />
      <Totals />
      <Panels />
    </Box>
  </StandardPage>
);
