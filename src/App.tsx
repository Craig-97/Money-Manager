import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import { client } from './graphql';
import { AppRoutes } from './routes';
import { UserProvider, SnackbarProvider } from './state';
import { theme } from './styles';
import './styles/app.scss';

export const App = () => (
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <UserProvider>
        <SnackbarProvider>
          <Box
            className="app"
            sx={{
              textAlign: 'left',
              bgcolor: 'background.default',
              minHeight: '100vh',
              fontSize: 'calc(10px + 2vmin)',
              color: 'text.primary',
              overflowX: 'hidden',
              overflowY: 'auto'
            }}>
            <Router>
              <AppRoutes />
            </Router>
          </Box>
        </SnackbarProvider>
      </UserProvider>
    </ThemeProvider>
  </ApolloProvider>
);
