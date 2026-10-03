// Each page is its own chunk. The router loads them lazily, and nav links call these on
// hover or focus so the chunk is usually ready by the time the link is clicked.
export const pageModules = {
  dashboard: () => import('~/pages/Dashboard'),
  forecast: () => import('~/pages/Forecast'),
  notes: () => import('~/pages/Notes'),
  profile: () => import('~/pages/Profile'),
  setup: () => import('~/pages/Setup'),
  signIn: () => import('~/pages/SignIn')
} as const;

export type PageName = keyof typeof pageModules;

export const preloadPage = (page: PageName) => {
  void pageModules[page]();
};
