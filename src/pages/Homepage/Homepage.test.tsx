import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createFakeApi } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const openHome = async () => {
  const app = renderApp();
  await screen.findByText('BANK BALANCE');
  return app;
};

// The card for a total is the button that contains its title
const card = (title: string) => screen.getByText(title).closest('button') as HTMLElement;

describe('Homepage totals', () => {
  it('shows the totals calculated from the account', async () => {
    await openHome();

    expect(card('BANK BALANCE')).toHaveTextContent('£1000');
    expect(screen.getByText('FREE TO SPEND').parentElement).toHaveTextContent('£1600');
    expect(card('MONTHLY BILLS')).toHaveTextContent('£830');
    expect(screen.getByText('PAYDAY BALANCE').parentElement).toHaveTextContent('£4100');
    expect(screen.getByText('PAYDAY DISC').parentElement).toHaveTextContent('£3270');
    expect(card('MONTHLY INCOME')).toHaveTextContent('£2500');
    expect(screen.getByText('DISC INCOME').parentElement).toHaveTextContent('£1670');
  });

  it('lists upcoming payments and monthly bills in tabs', async () => {
    const { user } = await openHome();

    expect(screen.getByText('Holiday')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /monthly bills/i }));
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('Internet')).toBeInTheDocument();
  });
});

describe('Bank balance', () => {
  it('updates the bank balance and the totals derived from it', async () => {
    const { user, api } = await openHome();

    await user.click(card('BANK BALANCE'));
    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '1500');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(card('BANK BALANCE')).toHaveTextContent('£1500'));
    expect(api.callsTo('EditAccount')).toEqual([
      { id: 'account-1', account: { bankBalance: 1500 } }
    ]);
    expect(screen.getByText('FREE TO SPEND').parentElement).toHaveTextContent('£2100');
    expect(await screen.findByText('Bank Balance updated')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('can be saved with the enter key', async () => {
    const { user, api } = await openHome();

    await user.click(card('BANK BALANCE'));
    const input = within(await screen.findByRole('dialog')).getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '750{Enter}');

    await waitFor(() => expect(card('BANK BALANCE')).toHaveTextContent('£750'));
    expect(api.callsTo('EditAccount')).toHaveLength(1);
  });

  it('does not call the api when the value is unchanged', async () => {
    const { user, api } = await openHome();

    await user.click(card('BANK BALANCE'));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(api.callsTo('EditAccount')).toHaveLength(0);
  });
});

describe('Monthly income', () => {
  it('updates the monthly income', async () => {
    const { user, api } = await openHome();

    await user.click(card('MONTHLY INCOME'));
    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '3000');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(card('MONTHLY INCOME')).toHaveTextContent('£3000'));
    expect(api.callsTo('EditAccount')).toEqual([
      { id: 'account-1', account: { monthlyIncome: 3000 } }
    ]);
  });
});

describe('Adding a bill', () => {
  const fillBill = async (
    user: Awaited<ReturnType<typeof openHome>>['user'],
    name: string,
    amount: string
  ) => {
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), name);
    const amountInput = within(dialog).getByLabelText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, amount);
    return dialog;
  };

  it('creates the bill and updates the monthly bills total', async () => {
    const { user, api } = await openHome();

    await user.click(card('MONTHLY BILLS'));
    const dialog = await fillBill(user, 'Gym', '25');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(card('MONTHLY BILLS')).toHaveTextContent('£855'));
    expect(api.callsTo('CreateBill')).toEqual([
      { bill: { name: 'Gym', amount: 25, paid: false, account: 'account-1' } }
    ]);
    expect(await screen.findByText('Gym bill added')).toBeInTheDocument();
  });

  it('requires a name before the form can be saved', async () => {
    const { user } = await openHome();

    await user.click(card('MONTHLY BILLS'));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Name'), 'Gym');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Save' })).toBeEnabled());
  });

  it('resets the form after a successful save', async () => {
    const { user } = await openHome();

    await user.click(card('MONTHLY BILLS'));
    const dialog = await fillBill(user, 'Gym', '25');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(card('MONTHLY BILLS'));
    const reopened = await screen.findByRole('dialog');
    expect(within(reopened).getByLabelText('Name')).toHaveValue('');
    expect(within(reopened).getByLabelText('Amount')).toHaveValue(0);
  });

  it('discards entered values when cancelled', async () => {
    const { user, api } = await openHome();

    await user.click(card('MONTHLY BILLS'));
    const dialog = await fillBill(user, 'Gym', '25');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(card('MONTHLY BILLS'));
    expect(within(await screen.findByRole('dialog')).getByLabelText('Name')).toHaveValue('');
    expect(api.callsTo('CreateBill')).toHaveLength(0);
  });
});

describe('Editing a bill', () => {
  const openRent = async () => {
    const app = await openHome();
    await app.user.click(screen.getByRole('tab', { name: /monthly bills/i }));
    await app.user.click(screen.getByText('Rent'));
    const dialog = await screen.findByRole('dialog');
    return { ...app, dialog };
  };

  it('opens the bill with its current values', async () => {
    const { dialog } = await openRent();

    expect(within(dialog).getByText('Edit Monthly Bill')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Name')).toHaveValue('Rent');
    expect(within(dialog).getByLabelText('Amount')).toHaveValue(800);
    expect(within(dialog).getByRole('checkbox', { name: 'Paid' })).not.toBeChecked();
  });

  it('saves changes and updates the totals', async () => {
    const { user, api, dialog } = await openRent();

    const amount = within(dialog).getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '750');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(card('MONTHLY BILLS')).toHaveTextContent('£780'));
    expect(api.callsTo('EditBill')).toEqual([
      { id: 'bill-1', bill: { name: 'Rent', amount: 750, paid: false, account: 'account-1' } }
    ]);
    expect(await screen.findByText('Rent bill updated')).toBeInTheDocument();
  });

  it('deducts a newly paid bill from the bank balance', async () => {
    const { user, api, dialog } = await openRent();

    await user.click(within(dialog).getByRole('checkbox', { name: 'Paid' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(card('BANK BALANCE')).toHaveTextContent('£200'));
    expect(api.callsTo('EditAccount')).toEqual([
      { id: 'account-1', account: { bankBalance: 200 } }
    ]);
  });

  it('deletes the bill', async () => {
    const { user, api, dialog } = await openRent();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByText('Rent')).not.toBeInTheDocument());
    expect(api.callsTo('DeleteBill')).toEqual([{ id: 'bill-1' }]);
    expect(card('MONTHLY BILLS')).toHaveTextContent('£30');
  });
});

describe('Upcoming payments', () => {
  it('adds a payment', async () => {
    const { user, api } = await openHome();

    await user.click(card('PAYMENTS DUE'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Add Upcoming Payment')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Name'), 'Car service');
    const amount = within(dialog).getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '150');
    // jsdom can't type into date inputs, so set the value directly
    fireEvent.change(within(dialog).getByLabelText('Due Date'), {
      target: { value: '2099-07-01' }
    });
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Car service')).toBeInTheDocument();
    const [variables] = api.callsTo('CreateOneOffPayment') as {
      oneOffPayment: Record<string, unknown>;
    }[];
    expect(variables.oneOffPayment).toMatchObject({
      name: 'Car service',
      amount: 150,
      account: 'account-1'
    });
  });

  it('edits and deletes an existing payment', async () => {
    const { user, api } = await openHome();

    await user.click(screen.getByText('Holiday'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Name')).toHaveValue('Holiday');
    expect(within(dialog).getByLabelText('Amount')).toHaveValue(200);

    const amount = within(dialog).getByLabelText('Amount');
    await user.clear(amount);
    await user.type(amount, '300');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.callsTo('EditOneOffPayment')).toHaveLength(1));
    expect(api.callsTo('EditOneOffPayment')[0]).toMatchObject({ id: 'payment-1' });
  });
});

describe('Account without bills or payments', () => {
  it('renders empty panels', async () => {
    const api = createFakeApi();
    api.db.account!.bills = [];
    api.db.account!.oneOffPayments = [];
    renderApp({ api });

    await screen.findByText('BANK BALANCE');
    expect(card('MONTHLY BILLS')).toHaveTextContent('£0');
  });
});
