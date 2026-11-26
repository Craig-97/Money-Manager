import { MORE_LINKS } from '../../layout/BottomNav/MoreMenu/moreLinks';
import { morePanelClasses } from '../../layout/BottomNav/MoreMenu/morePanelClasses';
import { MoreSheet } from '../../layout/BottomNav/MoreSheet';
import { tourTarget } from '../tourSteps';

/*
 * More's pages where the menu opens, for the tour to point at. It's a picture of the menu: the real
 * one is a dialog that would take the tour's focus.
 */
export const TourMoreMenu = () => (
  <div aria-hidden="true" inert className={morePanelClasses} {...tourTarget('more-sheet')}>
    <MoreSheet links={MORE_LINKS} current={undefined} onNavigate={() => undefined} />
  </div>
);
