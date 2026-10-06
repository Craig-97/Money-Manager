import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { apiDate, createFakeApi, DEFAULT_ACCOUNT } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

// Nothing due before payday, so free to spend is the £1,000 balance; £2,500 income and a £750
// mortgage that isn't due until well after payday
const account = () => {
  const data = structuredClone(DEFAULT_ACCOUNT);
  data.oneOffPayments = [];
  data.recurringPayments[0].nextDueDate = apiDate('2099-01-28');
  return data;
};

const renderForecast = () =>
  renderApp({ route: '/forecast', api: createFakeApi({ account: account() }) });

describe('forecast', () => {
  it('projects the balance at a monthly spend', async () => {
    const { user } = renderForecast();

    const spend = await screen.findByLabelText('Spend per month');
    // Starts at the recurring £750 rounded up to the next £500
    expect(spend).toHaveValue('1,000');
    const figures = screen.getByRole('region', { name: 'Key figures' });
    // £1,000 + 12 × (£2,500 − £1,000)
    expect(within(figures).getByText('£19,000')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Recurring (£750)' }));

    expect(spend).toHaveValue('750');
    expect(within(figures).getByText('£22,000')).toBeInTheDocument();
    expect(
      screen.getByText('You’re spending exactly your recurring payments, so both lines match.')
    ).toBeInTheDocument();
  });

  it('allows a spend above the income, running the balance down', async () => {
    const { user } = renderForecast();

    const spend = await screen.findByLabelText('Spend per month');
    await user.clear(spend);
    await user.type(spend, '3000');

    expect(spend).toHaveValue('3,000');
    const figures = screen.getByRole('region', { name: 'Key figures' });
    // £1,000 + 12 × (£2,500 − £3,000)
    expect(within(figures).getByText('−£5,000')).toBeInTheDocument();
  });

  it('pages through two years month by month', async () => {
    const { user } = renderForecast();

    const table = await screen.findByRole('table', { name: 'Month by month' });
    expect(within(table).getAllByRole('row')).toHaveLength(7);
    expect(screen.getByText('1–6 of 24')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(screen.getByText('7–12 of 24')).toBeInTheDocument();
  });
});
