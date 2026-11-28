import { useMediaQuery } from '~/hooks/useMediaQuery';
import { SETUP_DESKTOP } from '../setupModel';

/* Whether setup shows its desktop layout, with the steps down the side, rather than mobile's */
export const useSetupDesktop = () => useMediaQuery(SETUP_DESKTOP);
