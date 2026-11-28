import { ReactNode, useRef } from 'react';
import { cn } from '~/lib/cn';
import { AlertDots } from '../AlertDots';
import { AlertPager } from '../AlertPager';

// How far a swipe has to travel to move to the next alert
const SWIPE_PX = 40;

interface StackedAlert {
  key: string;
  // What the alert is about, for screen readers
  label: string;
  content: ReactNode;
}

interface AlertStackProps {
  alerts: readonly StackedAlert[];
  index: number;
  onGo: (index: number) => void;
}

/*
 * Alerts one at a time, as the dashboard and Accounts show them. With more than one, a card peeks
 * out behind, and they page with the arrows, the dots or a swipe.
 */
export const AlertStack = ({ alerts, index, onGo }: AlertStackProps) => {
  const swipeFrom = useRef<number | null>(null);
  const alert = alerts[index];
  if (!alert) return null;
  const several = alerts.length > 1;

  return (
    <div
      role="region"
      aria-label="Alerts"
      aria-roledescription="carousel"
      className={cn('relative md:-mb-3', several && 'pb-2.5')}>
      {several ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-3.5 bottom-0 h-[30px] rounded-b-[20px] border border-t-0 border-border bg-surface-2 md:inset-x-[22px] md:rounded-b-[22px]"
        />
      ) : null}
      <section
        aria-label={alert.label}
        aria-roledescription="slide"
        onPointerDown={event => (swipeFrom.current = event.clientX)}
        onPointerUp={event => {
          if (swipeFrom.current === null) return;
          const moved = event.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (moved < -SWIPE_PX) onGo(index + 1);
          else if (moved > SWIPE_PX) onGo(index - 1);
        }}
        className="relative flex touch-pan-y flex-col gap-3 rounded-[22px] border border-border bg-surface p-3.5 transition-[translate,box-shadow,border-color] duration-200 md:flex-row md:flex-wrap md:items-center md:gap-4 md:rounded-3xl md:py-3 md:pr-3 md:pl-3.5 md:hover:-translate-y-0.5 md:hover:border-border-strong md:hover:shadow-[0_22px_44px_-28px_var(--shadow)]">
        {/* Every alert sits in the same place, the others hidden, so the stack is as tall as the
            tallest at this width and paging between them doesn't move the page */}
        <div className="grid min-w-0 md:flex-1">
          {alerts.map((item, at) => (
            <div
              key={item.key}
              aria-hidden={at === index ? undefined : true}
              inert={at !== index}
              className={cn(
                'flex flex-col gap-3 [grid-area:1/1] md:flex-row md:flex-wrap md:items-center md:gap-4',
                at !== index && 'invisible'
              )}>
              {item.content}
            </div>
          ))}
        </div>
        {several ? (
          <>
            <AlertPager index={index} count={alerts.length} onGo={onGo} />
            <AlertDots index={index} count={alerts.length} onGo={onGo} />
          </>
        ) : null}
      </section>
    </div>
  );
};
