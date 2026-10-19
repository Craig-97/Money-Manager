import { Navigate, RouteObject } from 'react-router';
import { FullPageLoader } from '~/components/feedback/FullPageLoader';
import { AppShell } from '~/components/layout/AppShell';
import { ROUTES } from '~/constants';
import { PublicOnly, RequireBudget, RequireAuth, RequireNoBudget } from '../guards';
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
            path: ROUTES.home,
            lazy: async () => ({ Component: (await pageModules.landing()).Landing })
          },
          {
            path: ROUTES.signIn,
            lazy: async () => ({ Component: (await pageModules.signIn()).SignIn })
          },
          {
            path: ROUTES.register,
            lazy: async () => ({ Component: (await pageModules.register()).Register })
          },
          {
            path: ROUTES.forgotPassword,
            lazy: async () => ({
              Component: (await pageModules.forgotPassword()).ForgotPassword
            })
          }
        ]
      },
      // Open whether signed in or not: the link comes from an email, and resetting signs you in
      {
        path: ROUTES.resetPassword,
        lazy: async () => ({ Component: (await pageModules.resetPassword()).ResetPassword })
      },
      {
        Component: RequireAuth,
        children: [
          {
            Component: RequireNoBudget,
            children: [
              {
                path: ROUTES.setup,
                lazy: async () => ({ Component: (await pageModules.setup()).Setup })
              }
            ]
          },
          {
            Component: RequireBudget,
            children: [
              {
                Component: AppShell,
                children: [
                  {
                    path: ROUTES.dashboard,
                    lazy: async () => ({ Component: (await pageModules.dashboard()).Dashboard })
                  },
                  {
                    path: ROUTES.recurring,
                    lazy: async () => ({ Component: (await pageModules.recurring()).Recurring })
                  },
                  {
                    path: ROUTES.forecast,
                    lazy: async () => ({ Component: (await pageModules.forecast()).Forecast })
                  },
                  {
                    path: ROUTES.accounts,
                    lazy: async () => ({ Component: (await pageModules.accounts()).Accounts })
                  },
                  {
                    path: ROUTES.debts,
                    lazy: async () => ({ Component: (await pageModules.debts()).Debts })
                  },
                  {
                    path: ROUTES.debt,
                    lazy: async () => ({ Component: (await pageModules.debt()).DebtDetail })
                  },
                  {
                    path: ROUTES.notes,
                    lazy: async () => ({ Component: (await pageModules.notes()).Notes })
                  },
                  {
                    path: ROUTES.reminders,
                    lazy: async () => ({ Component: (await pageModules.reminders()).Reminders })
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
