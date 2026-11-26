import { TourStop } from '../TourStop';
import { useTourSteps } from '../useTourSteps';

/*
 * The first-time tour: the dashboard's parts, the payday prompt, then each page's link. It runs
 * over whatever's on screen, so it lives in the app shell; it starts on the dashboard.
 */
export const Tour = () => {
  const { steps, index, current, isDesktop } = useTourSteps();
  if (index === null || !current) return null;
  return (
    <TourStop
      // Each stop starts afresh, and so does the tour when the screen changes between layouts
      key={`${isDesktop}-${index}`}
      step={current}
      index={index}
      total={steps.length}
      isDesktop={isDesktop}
    />
  );
};
