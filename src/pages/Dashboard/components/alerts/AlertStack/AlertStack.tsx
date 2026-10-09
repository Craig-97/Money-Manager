import { useRef } from 'react';
import { cn } from '~/lib/cn';
import { renewalHeading } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Dashboard } from '../../../hooks';
import { AlertDots } from '../AlertDots';
import { AlertPager } from '../AlertPager';
import { DueTodayAlert } from '../DueTodayAlert';
import { RenewalAlert } from '../RenewalAlert';

// How far a swipe has to travel to move to the next alert
const SWIPE_PX = 40;

/*
 * The dashboard's alerts, one at a time: due today first, then renewals that have gone by. With
 * more than one, a card peeks out behind, and they page with the arrows, the dots or a swipe.
 */
export const AlertStack = ({ dashboard }: { dashboard: Dashboard }) => {
  const { alerts, index, alert, go, later } = dashboard.alerts;
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const swipeFrom = useRef<number | null>(null);
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
        aria-label={
          alert.kind === 'due'
            ? 'Due today'
            : renewalHeading(alert.payment, alert.renewal, dashboard.today)
        }
        aria-roledescription="slide"
        onPointerDown={event => (swipeFrom.current = event.clientX)}
        onPointerUp={event => {
          if (swipeFrom.current === null) return;
          const moved = event.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (moved < -SWIPE_PX) go(index + 1);
          else if (moved > SWIPE_PX) go(index - 1);
        }}
        className="relative flex touch-pan-y flex-col gap-3 rounded-[22px] border border-border bg-surface p-3.5 transition-[translate,box-shadow,border-color] duration-200 md:flex-row md:flex-wrap md:items-center md:gap-4 md:rounded-3xl md:py-3 md:pr-3 md:pl-3.5 md:hover:-translate-y-0.5 md:hover:border-border-strong md:hover:shadow-[0_22px_44px_-28px_var(--shadow)]">
        {alert.kind === 'due' ? (
          <DueTodayAlert
            payment={alert.payment}
            onLater={() => later(alert)}
            onPay={() => void dashboard.actions.pay([alert.payment])}
          />
        ) : (
          <RenewalAlert
            payment={alert.payment}
            renewal={alert.renewal}
            today={dashboard.today}
            onLater={() => later(alert)}
            onUpdate={() => openEdit('recurring', alert.payment.id)}
          />
        )}
        {several ? (
          <>
            <AlertPager index={index} count={alerts.length} onGo={go} />
            <AlertDots index={index} count={alerts.length} onGo={go} />
          </>
        ) : null}
      </section>
    </div>
  );
};
