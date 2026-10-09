export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  recurring: '/recurring',
  forecast: '/forecast',
  notes: '/notes',
  profile: '/profile',
  setup: '/setup',
  signIn: '/sign-in',
  register: '/register',
  forgotPassword: '/forgot-password',
  // The API's reset email links here with ?token=
  resetPassword: '/reset-password'
} as const;
