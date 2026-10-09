import { isInCycle } from '~/lib/payments';
import { TABS } from '../../dashboardModel';
import { Dashboard } from '../../hooks';

const counts = (dashboard: Dashboard) => {
  const { payments, cycle } = dashboard;
  return {
    upcoming: payments.filter(p => isInCycle(p, cycle)).length,
    recurring: payments.filter(p => p.kind === 'recurring').length,
    oneOff: payments.filter(p => p.kind === 'oneOff').length
  };
};

export const tabOptions = (dashboard: Dashboard) => {
  const count = counts(dashboard);
  return TABS.map(tab => ({ ...tab, count: count[tab.value] }));
};
