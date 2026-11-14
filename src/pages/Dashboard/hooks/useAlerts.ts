import { useState } from 'react';
import { useAlertIndex } from '~/hooks/useAlertIndex';
import { useReminderActions } from '~/hooks/useReminderActions';
import { isRenewalDue, Payment, RecurringPayment, Renewal, renewalOf } from '~/lib/payments';
import {
  dueKey,
  isAway,
  isStillDue,
  overdueKey,
  ReminderStates,
  renewalKey
} from '~/lib/reminders';

type DashboardAlert =
  | { kind: 'overdue'; payment: Payment; due: Date }
  | { kind: 'due'; payment: Payment }
  | { kind: 'renewal'; payment: RecurringPayment; renewal: Renewal };

interface AlertsInput {
  budgetId: string;
  payments: Payment[];
  today: Date;
  dueToday: Payment | undefined;
  // What's been done with reminders, which the renewal alerts share
  states: ReminderStates;
}

/*
 * The alerts at the top of the dashboard, one at a time: payments gone by unpaid, something due
 * today, then renewals, both coming up within their reminder and gone by without the next one being
 * set. "Later" hides due today for this visit. For an overdue payment or a renewal it's the same as
 * its reminder's Later: put away on the budget, so it stays away on other devices and under
 * Reminders too. × clears due today or a renewal, as its reminder's × does; an overdue payment stays
 * until it's paid or skipped.
 */
export const useAlerts = ({ budgetId, payments, today, dueToday, states }: AlertsInput) => {
  const [dueDismissed, setDueDismissed] = useState(false);
  const actions = useReminderActions({ budgetId, states, today });

  // Put away with Later, or cleared under Reminders
  const away = (key: string) => isAway(states.get(key), today);

  // Renewals inside their reminder, and ones that have gone by without the next date being set.
  // By date, so the ones that have gone by come first.
  const renewals = payments
    .flatMap(payment => {
      if (payment.kind !== 'recurring') return [];
      const renewal = renewalOf(payment, today);
      return renewal && isRenewalDue(renewal) && !away(renewalKey(payment, renewal))
        ? [{ kind: 'renewal' as const, payment, renewal }]
        : [];
    })
    .sort((a, b) => a.renewal.date.getTime() - b.renewal.date.getTime());

  // Payments whose date has gone by without being paid (or, for a recurring one, skipped),
  // oldest first
  const overdue = payments
    .flatMap(payment =>
      payment.dueDate &&
      payment.dueDate < today &&
      isStillDue(payment) &&
      !away(overdueKey(payment, payment.dueDate))
        ? [{ kind: 'overdue' as const, payment, due: payment.dueDate }]
        : []
    )
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  const alerts: DashboardAlert[] = [
    ...overdue,
    ...(dueToday && !dueDismissed && !away(dueKey(dueToday, dueToday.dueDate ?? today))
      ? [{ kind: 'due' as const, payment: dueToday }]
      : []),
    ...renewals
  ];
  const { index, go } = useAlertIndex(alerts.length);

  return {
    alerts,
    index,
    alert: alerts[index] as DashboardAlert | undefined,
    go,
    later: (alert: DashboardAlert) => {
      if (alert.kind === 'due') setDueDismissed(true);
      else if (alert.kind === 'overdue') {
        void actions.later({ key: overdueKey(alert.payment, alert.due), kind: 'overdue' });
      } else {
        void actions.later({
          key: renewalKey(alert.payment, alert.renewal),
          kind: alert.renewal.passed ? 'renewed' : 'renewal'
        });
      }
    },
    clear: (alert: DashboardAlert) => {
      if (alert.kind === 'due')
        void actions.clear({
          key: dueKey(alert.payment, alert.payment.dueDate ?? today),
          kind: 'due'
        });
      else if (alert.kind === 'renewal') {
        void actions.clear({
          key: renewalKey(alert.payment, alert.renewal),
          kind: alert.renewal.passed ? 'renewed' : 'renewal'
        });
      }
    }
  };
};
