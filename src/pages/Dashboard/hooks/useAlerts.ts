import { useState } from 'react';
import { useAlertIndex } from '~/hooks/useAlertIndex';
import { useReminderActions } from '~/hooks/useReminderActions';
import {
  isRateEndDue,
  isRenewalDue,
  Payment,
  RateEnd,
  rateEndOf,
  RecurringPayment,
  Renewal,
  renewalOf
} from '~/lib/payments';
import {
  dueKey,
  isAway,
  isStillDue,
  overdueKey,
  rateEndKey,
  ReminderStates,
  renewalKey
} from '~/lib/reminders';

type DashboardAlert =
  | { kind: 'overdue'; payment: Payment; due: Date }
  | { kind: 'due'; payment: Payment }
  | { kind: 'renewal'; payment: RecurringPayment; renewal: Renewal }
  | { kind: 'rateEnds'; payment: RecurringPayment; rateEnd: RateEnd };

type DatedAlert = Extract<DashboardAlert, { kind: 'renewal' | 'rateEnds' }>;

// A renewal's or a rate end's date, and its reminder's key and kind, which it shares with Reminders
const alertDate = (alert: DatedAlert) =>
  (alert.kind === 'renewal' ? alert.renewal : alert.rateEnd).date;
const reminderOf = (alert: DatedAlert) =>
  alert.kind === 'renewal'
    ? {
        key: renewalKey(alert.payment, alert.renewal),
        kind: alert.renewal.passed ? ('renewed' as const) : ('renewal' as const)
      }
    : {
        key: rateEndKey(alert.payment, alert.rateEnd),
        kind: alert.rateEnd.passed ? ('rateEnded' as const) : ('rateEnds' as const)
      };

interface AlertsInput {
  budgetId: string;
  payments: Payment[];
  today: Date;
  dueToday: Payment | undefined;
  // What's been done with reminders, which the renewal and rate end alerts share
  states: ReminderStates;
}

/*
 * The alerts at the top of the dashboard, one at a time: payments gone by unpaid, something due
 * today, then renewals and debts' rate endings, among them by date, both coming up within their
 * reminder and gone by without the next one being set. "Later" hides due today for this visit. For
 * an overdue payment, a renewal or a rate end it's the same as its reminder's Later: put away on
 * the budget, so it stays away on other devices and under Reminders too. × clears due today, a
 * renewal or a rate end, as its reminder's × does; an overdue payment stays until it's paid or
 * skipped.
 */
export const useAlerts = ({ budgetId, payments, today, dueToday, states }: AlertsInput) => {
  const [dueDismissed, setDueDismissed] = useState(false);
  const actions = useReminderActions({ budgetId, states, today });

  // Put away with Later, or cleared under Reminders
  const away = (key: string) => isAway(states.get(key), today);

  // Renewals and rate ends inside their reminder, and ones that have gone by without the next date
  // being set. By date, so the ones that have gone by come first.
  const renewals = payments
    .flatMap((payment): DatedAlert[] => {
      if (payment.kind !== 'recurring') return [];
      const renewal = renewalOf(payment, today);
      const rateEnd = rateEndOf(payment, today);
      return [
        ...(renewal && isRenewalDue(renewal)
          ? [{ kind: 'renewal' as const, payment, renewal }]
          : []),
        ...(rateEnd && isRateEndDue(rateEnd)
          ? [{ kind: 'rateEnds' as const, payment, rateEnd }]
          : [])
      ].filter(alert => !away(reminderOf(alert).key));
    })
    .sort((a, b) => alertDate(a).getTime() - alertDate(b).getTime());

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
        void actions.later(reminderOf(alert));
      }
    },
    clear: (alert: DashboardAlert) => {
      if (alert.kind === 'due')
        void actions.clear({
          key: dueKey(alert.payment, alert.payment.dueDate ?? today),
          kind: 'due'
        });
      else if (alert.kind !== 'overdue') void actions.clear(reminderOf(alert));
    }
  };
};
