import { showToast } from '~/state/toast';
import { useTourStore } from '~/state/tour';

/* Once the tour is done with or turned down, it can still be had again */
export const showReplayToast = () =>
  showToast({
    message: 'Replay it any time from Profile',
    action: { label: 'Replay tour', onClick: () => useTourStore.getState().start() }
  });
