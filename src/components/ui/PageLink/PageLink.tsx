import { Link, LinkProps } from 'react-router';
import { PageName, preloadPage } from '~/app/routes/pageModules';

interface PageLinkProps extends LinkProps {
  // The page the link opens. Its code starts loading on hover or focus.
  page: PageName;
}

/* A link to another page that preloads it, so the page is usually ready by the time it's clicked */
export const PageLink = ({ page, onMouseEnter, onFocus, ...props }: PageLinkProps) => (
  <Link
    onMouseEnter={event => {
      preloadPage(page);
      onMouseEnter?.(event);
    }}
    onFocus={event => {
      preloadPage(page);
      onFocus?.(event);
    }}
    {...props}
  />
);
