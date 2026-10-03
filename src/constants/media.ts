// Keep in step with the breakpoints in src/styles/index.css
export const MEDIA = {
  // The desktop layout (sidebar, dialogs) from 768px; below it the mobile layout
  desktop: '(min-width: 48rem)',
  // The sidebar is expanded by default from 1101px; below it the icon rail
  wide: '(min-width: 68.8125rem)'
} as const;
