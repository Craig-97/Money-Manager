// Each page is its own chunk. The router loads them lazily, and nav links call these on
// hover or focus so the chunk is usually ready by the time the link is clicked.
export const pageModules = {
  dashboard: () => import('~/pages/Dashboard'),
  recurring: () => import('~/pages/Recurring'),
  forecast: () => import('~/pages/Forecast'),
  accounts: () => import('~/pages/Accounts'),
  debts: () => import('~/pages/Debts'),
  notes: () => import('~/pages/Notes'),
  reminders: () => import('~/pages/Reminders'),
  profile: () => import('~/pages/Profile'),
  setup: () => import('~/pages/Setup'),
  landing: () => import('~/pages/Landing'),
  signIn: () => import('~/pages/SignIn'),
  register: () => import('~/pages/Register'),
  forgotPassword: () => import('~/pages/ForgotPassword'),
  resetPassword: () => import('~/pages/ResetPassword')
} as const;

export type PageName = keyof typeof pageModules;

export const preloadPage = (page: PageName) => {
  void pageModules[page]();
};
