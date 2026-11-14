export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  recurring: '/recurring',
  forecast: '/forecast',
  accounts: '/accounts',
  debts: '/debts',
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
