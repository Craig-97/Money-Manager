import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Payment, RecurringPayment, Renewal, renewalOf } from '~/lib/payments';
import { isSnoozed, renewalKey, useRenewalSnoozeStore } from '~/state/renewalSnooze';

type DashboardAlert =
  | { kind: 'due'; payment: Payment }
  | { kind: 'renewal'; payment: RecurringPayment; renewal: Renewal };

interface AlertsInput {
  payments: Payment[];
  today: Date;
  dueToday: Payment | undefined;
}

/*
 * The alerts at the top of the dashboard, one at a time: something due today, then renewals, both
 * coming up within their reminder and gone by without the next one being set. "Later" hides due today for this visit, and puts
 * a renewal away for a few days.
 */
export const useAlerts = ({ payments, today, dueToday }: AlertsInput) => {
  const [dueDismissed, setDueDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const { until, snooze } = useRenewalSnoozeStore(
    useShallow(s => ({ until: s.until, snooze: s.snooze }))
  );

  // Renewals inside their reminder, and ones that have gone by without the next date being set.
  // By date, so the ones that have gone by come first.
  const renewals = payments
    .flatMap(payment => {
      if (payment.kind !== 'recurring') return [];
      const renewal = renewalOf(payment, today);
      return renewal &&
        (renewal.passed || renewal.soon) &&
        !isSnoozed(until, renewalKey(payment.id, renewal.date))
        ? [{ kind: 'renewal' as const, payment, renewal }]
        : [];
    })
    .sort((a, b) => a.renewal.date.getTime() - b.renewal.date.getTime());

  const alerts: DashboardAlert[] = [
    ...(dueToday && !dueDismissed ? [{ kind: 'due' as const, payment: dueToday }] : []),
    ...renewals
  ];
  // Dealing with the last one moves back to the one before
  const current = Math.min(index, Math.max(0, alerts.length - 1));
  const go = (next: number) => setIndex(Math.max(0, Math.min(alerts.length - 1, next)));

  return {
    alerts,
    index: current,
    alert: alerts[current] as DashboardAlert | undefined,
    go,
    later: (alert: DashboardAlert) =>
      alert.kind === 'due'
        ? setDueDismissed(true)
        : snooze(renewalKey(alert.payment.id, alert.renewal.date))
  };
};

export type Alerts = ReturnType<typeof useAlerts>;
