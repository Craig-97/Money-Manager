import { blue, pink } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    mobile: true;
  }
}

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
      mobile: 0,
      xs: 345,
      sm: 660,
      md: 1185,
      lg: 1385,
      xl: 1920
    }
  },
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
  }
});
