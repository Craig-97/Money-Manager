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
      main: '#9333EA',
      light: '#A855F7',
      dark: '#7E22CE'
    },
    secondary: {
      main: '#F43F5E',
      light: '#FB7185',
      dark: '#E11D48'
    },
    error: {
      main: '#FF4D4D',
      light: '#FF6B6B',
      dark: '#FF3333'
    },
    success: {
      main: '#4ADE80',
      light: '#86EFAC',
      dark: '#16A34A'
    },
    background: {
      default: '#13111C',
      paper: '#1E1B2A'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E9D5FF'
    },
    divider: 'rgba(233, 213, 255, 0.08)'
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 24,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1B2A',
          background: 'linear-gradient(145deg, #1E1B2A, #2a2840)'
        }
      }
    }
  },
  shape: {
    borderRadius: 12
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
