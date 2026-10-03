import { Navigate, RouteObject } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { AppShell } from '~/components/layout/AppShell';
import { ROUTES } from '~/constants';
import { PublicOnly, RequireAccount, RequireAuth, RequireNoAccount } from '../guards';
import { RootLayout } from '../RootLayout';
import { RouteError } from '../RouteError';
import { pageModules } from './pageModules';

export const routes: RouteObject[] = [
  {
    Component: RootLayout,
    ErrorBoundary: RouteError,
    // Shown while the first route's code loads
    HydrateFallback: FullPageLoader,
    children: [
      {
        Component: PublicOnly,
        children: [
          {
            path: ROUTES.signIn,
            lazy: async () => ({ Component: (await pageModules.signIn()).SignIn })
          }
        ]
      },
      {
        Component: RequireAuth,
        children: [
          { path: ROUTES.home, element: <Navigate to={ROUTES.dashboard} replace /> },
          {
            Component: RequireNoAccount,
            children: [
              {
                path: ROUTES.setup,
                lazy: async () => ({ Component: (await pageModules.setup()).Setup })
              }
            ]
          },
          {
            Component: RequireAccount,
            children: [
              {
                Component: AppShell,
                children: [
                  {
                    path: ROUTES.dashboard,
                    lazy: async () => ({ Component: (await pageModules.dashboard()).Dashboard })
                  },
                  {
                    path: ROUTES.forecast,
                    lazy: async () => ({ Component: (await pageModules.forecast()).Forecast })
                  },
                  {
                    path: ROUTES.notes,
                    lazy: async () => ({ Component: (await pageModules.notes()).Notes })
                  },
                  {
                    path: ROUTES.profile,
                    lazy: async () => ({ Component: (await pageModules.profile()).Profile })
                  }
                ]
              }
            ]
          }
        ]
      },
      // Development only: the UI kit, for reviewing components against the design. The condition
      // is false in production builds, so the page isn't bundled.
      ...(import.meta.env.DEV
        ? [{ path: '/kit', lazy: async () => ({ Component: (await import('~/pages/Kit')).Kit }) }]
        : []),
      { path: '*', element: <Navigate to={ROUTES.home} replace /> }
    ]
  }
];
