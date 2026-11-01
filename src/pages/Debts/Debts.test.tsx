import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { holdExitAnimations } from '~/test/exitAnimation';
import {
  apiDate,
  createFakeApi,
  DEFAULT_BUDGET,
  FakeBudget,
  fakeRecord,
  FakeRecurringPayment
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026; payday is the last working day, Friday 30 October. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => vi.useRealTimers());

interface TestDebt {
  id: string;
  name: string;
  amount: number;
  firstPaymentDate: string;
  figures: { balance: number; startingBalance: number | null; apr: number };
  fields?: Partial<FakeRecurringPayment>;
}

const debt = ({
  id,
  name,
  amount,
  firstPaymentDate,
  figures,
  fields = {}
}: TestDebt): FakeRecurringPayment => ({
  id,
  name,
  amount,
  category: 'FINANCES',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate(firstPaymentDate),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  history: [],
  renewalDate: null,
  debt: { ...figures, balanceUpdatedAt: apiDate('2026-09-15') },
  ...fields
});

// The design's three debts: two due before payday, one after
const card = () =>
  debt({
    id: 'credit-card',
    name: 'Credit card',
    amount: 150,
    firstPaymentDate: '2026-01-15',
    figures: { balance: 2340, startingBalance: 3500, apr: 24.9 },
    fields: {
      category: 'FINANCES',
      history: [
        {
          ...fakeRecord('PAID', {
            dates: [apiDate('2026-09-15')],
            balanceChange: -150,
            debt: {
              interest: 49.12,
              reduction: 100.88,
              balanceAfter: 2340
            }
          }),
          open: false
        }
      ]
    }
  });
const car = () =>
  debt({
    id: 'car-finance',
    name: 'Car finance',
    amount: 245,
    firstPaymentDate: '2024-04-26',
    figures: {
      balance: 6860,
      startingBalance: 12000,
      apr: 6.9
    }
  });
const family = () =>
  debt({
    id: 'family-loan',
    name: 'Family loan',
    amount: 100,
    firstPaymentDate: '2025-03-01',
    figures: {
      balance: 800,
      startingBalance: 1500,
      apr: 0
    }
  });

// A card paid every month for the last `count` months, newest first, all before this cycle
const longPaidCard = (count: number) => {
  const history = Array.from({ length: count }, (_, i) => {
    const date = new Date(2026, 8 - i, 15);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-15`;
    return {
      ...fakeRecord('PAID', {
        dates: [apiDate(iso)],
        balanceChange: -150,
        debt: {
          interest: 40,
          reduction: 110,
          balanceAfter: 2340 + i * 110
        }
      }),
      open: false
    };
  });
  return { ...card(), history };
};

const budget = (recurringPayments = [card(), car(), family()]): FakeBudget => ({
  ...structuredClone(DEFAULT_BUDGET),
  cycleStartedOn: apiDate('2026-09-30'),
  oneOffPayments: [],
  recurringPayments
});

const renderDebts = (route = '/debts', payments?: FakeRecurringPayment[]) =>
  renderApp({ route, api: createFakeApi({ budget: budget(payments) }) });

describe('debts on desktop', () => {
  it("shows what's left, how it's worked out, and what's due before payday", async () => {
    renderDebts();

    const hero = await screen.findByRole('article', { name: 'Left to pay' });
    expect(hero).toHaveTextContent('£10,000.00');
    expect(hero).toHaveTextContent('£495 a month across 3 debts · about £88 of it is interest');
    expect(within(hero).getByRole('group')).toHaveTextContent(
      'Started at£17,000.00−Paid off£7,000.0041% so far=Left to pay£10,000.00'
    );

    const paidOff = screen.getByRole('region', { name: 'Paid off' });
    expect(within(paidOff).getByRole('img', { name: '41% paid off' })).toBeInTheDocument();
    expect(paidOff).toHaveTextContent('Credit cardThu 15 Oct£150.00');
    expect(paidOff).toHaveTextContent('Car financeMon 26 Oct£245.00');
    expect(paidOff).toHaveTextContent('Family loan is next due Sun 1 Nov, after payday.');
  });

  it('lists each debt with its rate, payment, progress and when it clears', async () => {
    renderDebts();

    const table = await screen.findByRole('table', { name: 'Debts' });
    const rows = within(table).getAllByRole('row').slice(1);
    // Highest rate first
    expect(
      rows.map(row => within(row).getByRole('button', { name: /^Edit / }).textContent)
    ).toEqual(['Credit card', 'Car finance', 'Family loan']);
    expect(rows[0]).toHaveTextContent('Recurring · on the 15th');
    expect(rows[2]).toHaveTextContent('Recurring · on the 1st · no interest');
    expect(rows[0]).toHaveTextContent('£150 a month · clears Jun 2028');
    expect(rows[0]).toHaveTextContent('24.9%£15033%£2,340.00');
    expect(table).toHaveTextContent('3 debts · £495 a month');
    expect(table).toHaveTextContent('Left to pay£10,000.00');
  });

  it('sorts the debts', async () => {
    const { user } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'Highest rate' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Least left' }));

    const names = within(screen.getByRole('table', { name: 'Debts' }))
      .getAllByRole('button', { name: /^Edit / })
      .map(button => button.textContent);
    expect(names).toEqual(['Family loan', 'Credit card', 'Car finance']);
  });

  it('shows a payoff plan, and applies the extra to the first debt in its order', async () => {
    const { user, api } = renderDebts();

    expect(
      await screen.findByText('As you are now, debt-free May 2029', { exact: false })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Payoff plan' }));
    await user.click(screen.getByRole('radio', { name: '+£50' }));

    const figures = screen.getByRole('group', { name: 'This plan' });
    expect(figures).toHaveTextContent('Debt-freeJun 202811 months sooner');
    expect(figures).toHaveTextContent('£850£308 less than now');
    expect(figures).toHaveTextContent('Each month£545£495 + £50 extra');

    await user.click(screen.getByRole('button', { name: 'Pay £50 extra from October' }));

    expect(await screen.findByText('Credit card is now £200.00 a month')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([
      { id: 'credit-card', input: { amount: 200 } }
    ]);
  });

  it("shows a debt's payments, with the next one due", async () => {
    const { user } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Credit card' }));
    await user.click(screen.getByRole('menuitem', { name: 'See payments' }));

    const dialog = await screen.findByRole('dialog', { name: 'Credit card payments' });
    const rows = await within(dialog).findAllByRole('row');
    expect(rows[1]).toHaveTextContent('Thu 15 OctDue£150.00≈ £2,239');
    expect(rows[2]).toHaveTextContent('Tue 15 SepPaid£150.00£2,340');
  });

  it('shows how paying more each month clears a debt sooner, and applies it', async () => {
    const { user, api } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Credit card' }));
    await user.click(screen.getByRole('menuitem', { name: 'Pay sooner' }));
    const dialog = await screen.findByRole('dialog', { name: 'Pay Credit card sooner' });
    expect(within(dialog).getByRole('button', { name: 'Pay more' })).toBeDisabled();

    fireEvent.change(within(dialog).getByRole('slider', { name: 'Pay extra each month' }), {
      target: { value: '50' }
    });
    expect(dialog).toHaveTextContent('6 months sooner');
    expect(dialog).toHaveTextContent('£148 less');

    await user.click(within(dialog).getByRole('button', { name: 'Pay £200 a month from October' }));

    expect(await screen.findByText('Credit card is now £200.00 a month')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([
      { id: 'credit-card', input: { amount: 200 } }
    ]);
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Pay Credit card sooner' })
      ).not.toBeInTheDocument()
    );
  });

  it('starts Pay sooner from no extra each time it opens', async () => {
    const { user } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Credit card' }));
    await user.click(screen.getByRole('menuitem', { name: 'Pay sooner' }));
    const dialog = await screen.findByRole('dialog', { name: 'Pay Credit card sooner' });
    fireEvent.change(within(dialog).getByRole('slider', { name: 'Pay extra each month' }), {
      target: { value: '50' }
    });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'More actions for Credit card' }));
    await user.click(screen.getByRole('menuitem', { name: 'Pay sooner' }));
    const reopened = await screen.findByRole('dialog', { name: 'Pay Credit card sooner' });
    expect(within(reopened).getByRole('slider', { name: 'Pay extra each month' })).toHaveValue('0');
  });

  it('shows the latest payments by month, and older ones when asked', async () => {
    const { user } = renderDebts('/debts', [longPaidCard(30), car(), family()]);

    await user.click(await screen.findByRole('button', { name: 'More actions for Credit card' }));
    await user.click(screen.getByRole('menuitem', { name: 'See payments' }));
    const dialog = await screen.findByRole('dialog', { name: 'Credit card payments' });
    const table = await within(dialog).findByRole('table', { name: 'Payments' });

    // The next one due, then the latest 12, each month under its own heading
    expect(
      within(table)
        .getAllByRole('rowgroup')
        .map(group => group.getAttribute('aria-label'))
    ).toEqual(expect.arrayContaining(['October 2026', 'September 2026', 'October 2025']));
    expect(within(table).getAllByRole('row')).toHaveLength(1 + 1 + 12);

    await user.click(within(dialog).getByRole('button', { name: 'Show older payments' }));
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(1 + 1 + 30));
    // Everything's showing, so there's nothing older to ask for
    expect(
      within(dialog).queryByRole('button', { name: 'Show older payments' })
    ).not.toBeInTheDocument();
  });

  it('keeps See payments as it was while Log an overpayment opens from it', async () => {
    holdExitAnimations();
    const { user } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Car finance' }));
    await user.click(screen.getByRole('menuitem', { name: 'See payments' }));
    const payments = await screen.findByRole('dialog', { name: 'Car finance payments' });
    await user.click(within(payments).getByRole('button', { name: 'Log an overpayment' }));

    const overpayment = await screen.findByRole('dialog', { name: 'Log an overpayment' });
    // Opened for Car finance, so it doesn't ask which debt
    expect(within(overpayment).queryByRole('combobox', { name: 'Debt' })).not.toBeInTheDocument();
    expect(overpayment).toHaveTextContent('£6,860.00 left on Car finance');
    const closing = screen
      .getAllByRole('dialog', { hidden: true })
      .find(dialog => dialog.getAttribute('data-state') === 'closed')!;
    // Hidden from screen readers under the new dialog, so its title is checked as it reads
    expect(closing).toHaveTextContent('Car finance payments');
  });

  it('logs an overpayment, which can be taken back', async () => {
    const { user, api } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'Log an overpayment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Log an overpayment' });
    // From the header it asks which debt
    expect(within(dialog).getByRole('combobox', { name: 'Debt' })).toHaveTextContent('Credit card');
    await user.type(within(dialog).getByLabelText('Amount'), '3000');
    await user.tab();
    expect(within(dialog).getByText("That's more than the £2,340.00 left")).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText('Amount'));
    await user.type(within(dialog).getByLabelText('Amount'), '200');
    await user.click(within(dialog).getByRole('button', { name: 'Log overpayment' }));

    expect(
      await screen.findByText('£200.00 paid off Credit card · off your balance')
    ).toBeInTheDocument();
    expect(api.callsTo('LogDebtOverpayment')).toEqual([
      { input: { budgetId: 'budget-1', recurringPaymentId: 'credit-card', amount: 200 } }
    ]);
    expect(screen.getByRole('article', { name: 'Left to pay' })).toHaveTextContent('£9,800.00');
    expect(screen.getByText('£200 paid off since payday')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(await screen.findByText('Took back the overpayment on Credit card')).toBeInTheDocument();
    expect(api.callsTo('UndoDebtOverpayment')).toHaveLength(1);
    expect(screen.getByRole('article', { name: 'Left to pay' })).toHaveTextContent('£10,000.00');
    expect(screen.queryByText(/paid off since payday/)).not.toBeInTheDocument();
  });

  it('opens the edit form ready to type a new balance', async () => {
    const { user } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Car finance' }));
    await user.click(screen.getByRole('menuitem', { name: 'Update balance' }));

    const dialog = await screen.findByRole('dialog', { name: 'Edit debt' });
    await waitFor(() => expect(within(dialog).getByLabelText('Balance left')).toHaveFocus());
    // From Debts it's always a debt
    expect(within(dialog).queryByRole('switch')).not.toBeInTheDocument();
  });

  it('deletes a debt', async () => {
    const { user } = renderDebts();

    await user.click(await screen.findByRole('button', { name: 'More actions for Family loan' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(await screen.findByText('Deleted Family loan')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Family loan' })).not.toBeInTheDocument();
  });

  it('offers to add one when there are none', async () => {
    const { user } = renderDebts('/debts', []);

    expect(await screen.findByText('No debts yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log an overpayment' })).not.toBeInTheDocument();

    await user.click(
      within(screen.getByRole('region', { name: 'Your debts' })).getByRole('button', {
        name: 'Add a debt'
      })
    );

    expect(await screen.findByRole('dialog', { name: 'Add a debt' })).toBeInTheDocument();
  });

  it("goes back to the list from a debt's own page, which is mobile only", async () => {
    renderDebts('/debts/credit-card');

    expect(await screen.findByRole('table', { name: 'Debts' })).toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: 'Pay extra each month' })).not.toBeInTheDocument();
  });
});

describe('debts on mobile', () => {
  beforeEach(() => setViewportWidth(390));

  it('lists the debts, each opening its own page', async () => {
    const { user } = renderDebts();

    const list = await screen.findByRole('region', { name: 'Your debts · 3' });
    const links = within(list).getAllByRole('link');
    expect(links[0]).toHaveTextContent('Credit card£2,34024.9% · £150 on the 15th');

    await user.click(links[0]);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Credit card' })
    ).toBeInTheDocument();
  });

  it('shows how much is paid off, overall and since payday', async () => {
    const { user } = renderDebts();

    const paidOff = await screen.findByRole('region', { name: 'Paid off' });
    expect(within(paidOff).getByRole('img', { name: '41% paid off' })).toBeInTheDocument();
    expect(paidOff).toHaveTextContent('£7,000 of £17,000 paid off');
    expect(within(paidOff).queryByText(/since payday/)).not.toBeInTheDocument();

    // An overpayment counts towards it
    await user.click(
      within(screen.getByRole('region', { name: 'Your debts · 3' })).getAllByRole('link')[0]
    );
    await user.click(await screen.findByRole('radio', { name: 'Payments' }));
    await user.click(screen.getByRole('button', { name: 'Log an overpayment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Log an overpayment' });
    await user.type(within(dialog).getByLabelText('Amount'), '100');
    await user.click(within(dialog).getByRole('button', { name: 'Log overpayment' }));
    await user.click(await screen.findByRole('link', { name: 'Back to debts' }));

    expect(await screen.findByText('£100 paid off since payday')).toBeInTheDocument();
  });

  it('steps through the orders with the sort button', async () => {
    const { user } = renderDebts();

    const sort = await screen.findByRole('button', { name: /^Sorted by highest rate/ });
    await user.click(sort);

    expect(sort).toHaveTextContent('Most left');
  });

  it('shows how paying more each month clears a debt sooner, and applies it', async () => {
    const { user, api } = renderDebts('/debts/credit-card');

    const slider = await screen.findByRole('slider', { name: 'Pay extra each month' });
    fireEvent.change(slider, { target: { value: '50' } });

    const section = screen.getByRole('region', { name: 'Pay sooner' });
    expect(section).toHaveTextContent('6 months sooner');
    expect(section).toHaveTextContent('£148 less');

    await user.click(screen.getByRole('button', { name: 'Pay £200 a month from October' }));

    expect(await screen.findByText('Credit card is now £200.00 a month')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([
      { id: 'credit-card', input: { amount: 200 } }
    ]);
  });

  it("shows a debt's payments and details", async () => {
    const { user } = renderDebts('/debts/credit-card');

    await user.click(await screen.findByRole('radio', { name: 'Payments' }));
    const payments = screen.getByRole('region', { name: 'Payments' });
    expect(await within(payments).findByText('Due in 13 days')).toBeInTheDocument();
    expect(within(payments).getByText('About £49 was interest')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Details' }));
    const details = screen.getByRole('region', { name: 'Details' });
    expect(details).toHaveTextContent('APR24.9%');
    expect(details).toHaveTextContent('Started at£3,500.00');
    expect(details).toHaveTextContent('Balance checked15 Sep');
  });

  it("shows a debt's latest payments by month, and older ones when asked", async () => {
    const { user } = renderDebts('/debts/credit-card', [longPaidCard(14), car(), family()]);

    await user.click(await screen.findByRole('radio', { name: 'Payments' }));
    const payments = screen.getByRole('region', { name: 'Payments' });
    expect(
      await within(payments).findByRole('region', { name: 'September 2026' })
    ).toBeInTheDocument();
    expect(within(payments).getAllByRole('listitem')).toHaveLength(1 + 12);

    await user.click(within(payments).getByRole('button', { name: 'Show older payments' }));

    await waitFor(() => expect(within(payments).getAllByRole('listitem')).toHaveLength(1 + 14));
    expect(within(payments).getByRole('region', { name: 'August 2025' })).toBeInTheDocument();
    // Log an overpayment stays under the list
    expect(
      within(payments).getByRole('button', { name: 'Log an overpayment' })
    ).toBeInTheDocument();
  });

  it("goes back to the list for a debt that isn't there", async () => {
    renderDebts('/debts/nope');

    expect(await screen.findByRole('heading', { level: 1, name: 'Debts' })).toBeInTheDocument();
  });

  it('adds a debt from the nav on a debt’s page, and marks More as current', async () => {
    const { user } = renderDebts('/debts/credit-card');

    const nav = (await screen.findAllByRole('navigation', { name: 'Main' })).find(element =>
      within(element).queryByRole('button', { name: 'More' })
    )!;
    expect(within(nav).getByRole('button', { name: 'More' })).toHaveAttribute('data-current');

    await user.click(within(nav).getByRole('button', { name: 'Add a debt' }));

    expect(await screen.findByRole('dialog', { name: 'Add a debt' })).toBeInTheDocument();
  });
});

describe('a debt paid off', () => {
  it('offers to delete it once its last payment is marked paid', async () => {
    const last = debt({
      id: 'loan',
      name: 'Old loan',
      amount: 100,
      firstPaymentDate: '2025-10-15',
      figures: { balance: 60, startingBalance: 1200, apr: 0 },
      // As the API sends it, so the fake API can pay it
      fields: { nextDueDate: apiDate('2026-10-15') }
    });
    const { user } = renderDebts('/recurring', [last]);

    await user.click(await screen.findByRole('button', { name: 'More actions for Old loan' }));
    await user.click(screen.getByRole('menuitem', { name: 'Mark as paid' }));

    expect(await screen.findByText('Old loan is paid off')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Deleted Old loan')).toBeInTheDocument();
  });
});

describe('debts on the recurring page', () => {
  it('shows each debt with what is left, and on mobile a card for them all', async () => {
    renderDebts('/recurring');

    const row = (await screen.findByRole('button', { name: 'Credit card' })).closest(
      '[role="row"]'
    )!;
    expect(row).toHaveTextContent('£2,340 left');

    setViewportWidth(390);
    const card = await screen.findByRole('link', { name: /£10,000 left/ });
    expect(card).toHaveTextContent('£10,000 left · debt-free May 2029');
    expect(card).toHaveAttribute('href', '/debts');
  });
});
