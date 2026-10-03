import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ApolloProvider } from '@apollo/client/react';
import { TooltipProvider } from '~/components/ui/Tooltip';
import { client } from '~/graphql/client';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export const App = () => (
  <ApolloProvider client={client}>
    <TooltipProvider delayDuration={0}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </ApolloProvider>
);
