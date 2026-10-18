import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { holdExitAnimations } from '~/test/exitAnimation';
import {
  apiDate,
  createFakeApi,
  DEFAULT_ACCOUNT,
  FakeAccount,
  FakeRecurringPayment
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => vi.useRealTimers());

const carFinance: FakeRecurringPayment = {
  id: 'car-finance',
  name: 'Car finance',
  amount: 245,
  category: 'LOAN',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-15'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  debt: { balance: 6860, startingBalance: 12000, apr: 6.9, balanceUpdatedAt: null }
};

const account = (): FakeAccount => ({
  ...structuredClone(DEFAULT_ACCOUNT),
  recurringPayments: [...structuredClone(DEFAULT_ACCOUNT.recurringPayments), carFinance]
});

const renderAt = (route: string) =>
  renderApp({ route, api: createFakeApi({ account: account() }) });

describe('adding a recurring payment as a debt', () => {
  it('turns the form into a debt with the switch', async () => {
    const { user, api } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    const track = within(dialog).getByRole('switch', { name: 'Track as a debt' });
    expect(track).not.toBeChecked();
    expect(within(dialog).queryByRole('group', { name: 'Debt details' })).not.toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Name'), 'Personal loan');
    await user.type(within(dialog).getByLabelText('Amount'), '100');
    await user.click(track);

    // Always money out, ending when it's paid off
    expect(within(dialog).queryByRole('group', { name: 'Type' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('radio', { name: 'Renews' })).not.toBeInTheDocument();
    expect(within(dialog).getByText('When it’s paid off')).toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent('Loan');
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Paid offShown once you add the balance'
    );

    const details = within(dialog).getByRole('group', { name: 'Debt details' });
    await user.type(within(details).getByLabelText('Balance now'), '1200');
    await user.type(within(details).getByLabelText('APR'), '0');
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      'Paid offAbout Oct 2027 at £100 a month'
    );

    await user.click(within(dialog).getByRole('button', { name: 'Add debt' }));

    expect(await screen.findByText('Added Personal loan')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')).toEqual([
      {
        input: expect.objectContaining({
          name: 'Personal loan',
          amount: 100,
          type: 'EXPENSE',
          category: 'LOAN',
          lastPaymentDate: null,
          renewalDate: null,
          debt: { balance: 1200, apr: 0, startingBalance: null }
        })
      }
    ]);
  });

  it('only offers the switch for money going out', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'Income' }));

    expect(
      within(dialog).queryByRole('switch', { name: 'Track as a debt' })
    ).not.toBeInTheDocument();
  });

  it('says when a payment would never clear the debt', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.type(within(dialog).getByLabelText('Amount'), '5');
    await user.click(within(dialog).getByRole('switch', { name: 'Track as a debt' }));
    await user.type(within(dialog).getByLabelText('Balance now'), '1200');
    await user.type(within(dialog).getByLabelText('APR'), '12');

    expect(within(dialog).getByRole('status')).toHaveTextContent(
      "Not at £5 a month: it doesn't cover the interest"
    );
  });
});

describe('adding a debt from Debts', () => {
  it('is always a debt, with no switch', async () => {
    const { user, api } = renderAt('/debts');

    await user.click(await screen.findByRole('button', { name: 'Add a debt' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add a debt' });

    expect(within(dialog).queryByRole('switch')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('group', { name: 'Type' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: 'Category' })).toHaveTextContent(
      'Credit card'
    );
    expect(within(dialog).getByLabelText('Name')).toHaveAttribute(
      'placeholder',
      'e.g. Credit card'
    );

    await user.type(within(dialog).getByLabelText('Name'), 'Store card');
    await user.type(within(dialog).getByLabelText('Amount'), '40');
    expect(within(dialog).getByRole('button', { name: 'Add debt' })).toBeDisabled();

    // What's owed and the rate are needed for the payoff date
    await user.click(within(dialog).getByLabelText('Balance now'));
    await user.click(within(dialog).getByLabelText('APR'));
    await user.type(within(dialog).getByLabelText('APR'), '120');
    await user.tab();
    expect(within(dialog).getByText('Enter what you owe now')).toBeInTheDocument();
    expect(within(dialog).getByText('Enter a rate from 0 to 100%')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Balance now'), '600');
    await user.clear(within(dialog).getByLabelText('APR'));
    await user.type(within(dialog).getByLabelText('APR'), '29.9');
    await user.type(within(dialog).getByLabelText('Started at'), '900');
    await user.click(within(dialog).getByRole('button', { name: 'Add debt' }));

    expect(await screen.findByText('Added Store card')).toBeInTheDocument();
    expect(api.callsTo('CreateRecurringPayment')[0].input).toMatchObject({
      category: 'CREDIT_CARD',
      debt: { balance: 600, apr: 29.9, startingBalance: 900 }
    });
    expect(
      within(await screen.findByRole('table', { name: 'Debts' })).getByText('Store card')
    ).toBeInTheDocument();
  });
});

describe('editing a debt', () => {
  it("starts with the debt's figures and sends a new balance", async () => {
    const { user, api } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Edit Car finance' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });

    expect(within(dialog).getByRole('switch', { name: 'Track as a debt' })).toBeChecked();
    expect(within(dialog).getByLabelText('Balance now')).toHaveValue('6,860.00');
    expect(within(dialog).getByLabelText('APR')).toHaveValue('6.9');
    expect(within(dialog).getByLabelText('Started at')).toHaveValue('12,000.00');

    await user.clear(within(dialog).getByLabelText('Balance now'));
    await user.type(within(dialog).getByLabelText('Balance now'), '6500');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Car finance')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([
      {
        id: 'car-finance',
        input: expect.objectContaining({
          debt: { balance: 6500, apr: 6.9, startingBalance: 12000 }
        })
      }
    ]);
  });

  it('stops tracking it when the switch is turned off', async () => {
    const { user, api } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Edit Car finance' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('switch', { name: 'Track as a debt' }));

    expect(within(dialog).getByRole('group', { name: 'Type' })).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: 'Stops' })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Car finance')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({ debt: null });
  });

  it("doesn't send anything for a payment that was never a debt", async () => {
    const { user, api } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Edit Mortgage' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.clear(within(dialog).getByLabelText('Amount'));
    await user.type(within(dialog).getByLabelText('Amount'), '800');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Mortgage')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).not.toHaveProperty('debt');
  });
});

describe('closing the payment dialog', () => {
  it('keeps showing the payment while the sheet slides away', async () => {
    setViewportWidth(390);
    holdExitAnimations();
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Edit Car finance' }));
    const sheet = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(sheet).getByRole('button', { name: 'Cancel' }));

    // Still on screen while it animates away, as the payment it was, not a new one or the chooser
    const closing = await screen.findByRole('dialog', { hidden: true });
    expect(closing).toHaveAttribute('data-state', 'closed');
    expect(closing).toHaveAccessibleName('Edit recurring payment');
    expect(within(closing).getByLabelText('Name')).toHaveValue('Car finance');
    expect(within(closing).queryByText('What are you adding?')).not.toBeInTheDocument();
  });

  it('starts afresh each time it opens', async () => {
    const { user } = renderAt('/recurring');

    await user.click(await screen.findByRole('button', { name: 'Edit Car finance' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.clear(within(dialog).getByLabelText('Name'));
    await user.type(within(dialog).getByLabelText('Name'), 'Not saved');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await user.click(await screen.findByRole('button', { name: 'Edit Car finance' }));
    expect(
      within(await screen.findByRole('dialog', { name: 'Edit recurring payment' })).getByLabelText(
        'Name'
      )
    ).toHaveValue('Car finance');
  });
});
