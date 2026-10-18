export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  recurring: '/recurring',
  forecast: '/forecast',
  debts: '/debts',
  // One debt on mobile: how to pay it sooner, its payments and details
  debt: '/debts/:id',
  notes: '/notes',
  // What's gone off (New) and what's ahead (?tab=up)
  reminders: '/reminders',
  profile: '/profile',
  setup: '/setup',
  signIn: '/sign-in',
  register: '/register',
  forgotPassword: '/forgot-password',
  // The API's reset email links here with ?token=
  resetPassword: '/reset-password'
} as const;

/* The page for one debt */
export const debtPath = (id: string) => ROUTES.debt.replace(':id', encodeURIComponent(id));
