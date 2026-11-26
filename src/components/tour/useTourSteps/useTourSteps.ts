import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useTourStore } from '~/state/tour';
import { DESKTOP_STEPS, MOBILE_STEPS } from '../tourSteps';

/* The tour's steps for this screen, and the one showing, if the tour is running */
export const useTourSteps = () => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const index = useTourStore(s => s.step);
  const steps = isDesktop ? DESKTOP_STEPS : MOBILE_STEPS;

  return {
    steps,
    index,
    current: index === null ? undefined : steps[index],
    isDesktop
  };
};
