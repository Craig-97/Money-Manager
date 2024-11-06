import { createTheme } from '@mui/material/styles';
import { blue, pink } from '@mui/material/colors';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: blue[500]
    },
    secondary: {
      main: pink[500]
    }
  },
  shape: {
    borderRadius: 10
  },
  breakpoints: {
    values: {
      xs: 345,
      sm: 620,
      md: 920,
      lg: 1250,
      xl: 1536
    }
  }
});
