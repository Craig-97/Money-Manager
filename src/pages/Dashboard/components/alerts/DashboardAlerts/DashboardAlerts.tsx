import { AlertStack } from '~/components/alerts';
import { rateEndHeading, renewalHeading } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Dashboard } from '../../../hooks';
import { DueTodayAlert } from '../DueTodayAlert';
import { OverdueAlert } from '../OverdueAlert';
import { RateEndsAlert } from '../RateEndsAlert';
import { RenewalAlert } from '../RenewalAlert';

/*
 * The dashboard's alerts, one at a time: overdue payments first, then due today, then renewals and
 * rate endings
 */
export const DashboardAlerts = ({ dashboard }: { dashboard: Dashboard }) => {
  const { alerts, index, go, later, clear } = dashboard.alerts;
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const { today } = dashboard;
  const pay = (payment: (typeof alerts)[number]['payment']) =>
    void dashboard.actions.pay([payment]);

  return (
    <AlertStack
      index={index}
      onGo={go}
      alerts={alerts.map(item =>
        item.kind === 'overdue'
          ? {
              key: `overdue:${item.payment.id}`,
              label: `${item.payment.name} is overdue`,
              content: (
                <OverdueAlert
                  payment={item.payment}
                  due={item.due}
                  today={today}
                  onLater={() => later(item)}
                  onPay={() => pay(item.payment)}
                />
              )
            }
          : item.kind === 'due'
            ? {
                key: `due:${item.payment.id}`,
                label: 'Due today',
                content: (
                  <DueTodayAlert
                    payment={item.payment}
                    onLater={() => later(item)}
                    onPay={() => pay(item.payment)}
                    onClear={() => clear(item)}
                  />
                )
              }
            : item.kind === 'rateEnds'
              ? {
                  key: `rateEnds:${item.payment.id}`,
                  label: rateEndHeading(item.payment, item.rateEnd),
                  content: (
                    <RateEndsAlert
                      payment={item.payment}
                      rateEnd={item.rateEnd}
                      onLater={() => later(item)}
                      onUpdate={() => openEdit('recurring', { paymentId: item.payment.id })}
                      onClear={() => clear(item)}
                    />
                  )
                }
              : {
                  key: `renewal:${item.payment.id}`,
                  label: renewalHeading(item.payment, { renewal: item.renewal, today }),
                  content: (
                    <RenewalAlert
                      payment={item.payment}
                      renewal={item.renewal}
                      today={today}
                      onLater={() => later(item)}
                      onUpdate={() => openEdit('recurring', { paymentId: item.payment.id })}
                      onClear={() => clear(item)}
                    />
                  )
                }
      )}
    />
  );
};
