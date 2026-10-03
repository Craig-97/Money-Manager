// Media queries use rem so the layout follows the browser's text size setting. Values are written
// in the design's px (at the default 16px font size). Keep in step with src/styles/index.css.
const rem = (px: number) => `${px / 16}rem`;

export const MEDIA = {
  // The desktop layout (sidebar, dialogs) from 768px; below it the mobile layout
  desktop: `(min-width: ${rem(768)})`,
  // The sidebar is expanded by default from 1101px; below it the icon rail
  wide: `(min-width: ${rem(1101)})`
} as const;
