import { screen, waitFor } from '@testing-library/react';
import { createFakeApi } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const openForecast = async (api = createFakeApi()) => {
  const app = renderApp({ route: '/forecast', api });
  await screen.findByText('Balance Forecast');
  return app;
};

// The monthly spend field is the only text box on the page
const spendInput = () => screen.getByRole('textbox') as HTMLInputElement;

describe('Forecast page', () => {
  it('shows the current balances', async () => {
    await openForecast();

    expect(screen.getByText('BANK BALANCE').parentElement).toHaveTextContent('£1600');
    expect(screen.getByText('PAYDAY BALANCE').parentElement).toHaveTextContent('£4100');
  });

  it('defaults the monthly spend to the total of monthly bills once loaded', async () => {
    await openForecast();

    await waitFor(() => expect(spendInput()).toHaveValue('830'));
    expect(screen.getByText(/You could save £0\.00 per month/)).toBeInTheDocument();
  });

  it('compares a lower monthly spend with current bills', async () => {
    const { user } = await openForecast();
    await waitFor(() => expect(spendInput()).toHaveValue('830'));

    await user.clear(spendInput());
    await user.type(spendInput(), '500');

    expect(spendInput()).toHaveValue('500');
    expect(screen.getByText(/You could save £330\.00 per month/)).toBeInTheDocument();
  });

  it('compares a higher monthly spend with current bills', async () => {
    const { user } = await openForecast();
    await waitFor(() => expect(spendInput()).toHaveValue('830'));

    await user.clear(spendInput());
    await user.type(spendInput(), '1000');

    expect(screen.getByText(/You would spend £170\.00 more per month/)).toBeInTheDocument();
  });

  it('only accepts digits in the monthly spend', async () => {
    const { user } = await openForecast();
    await waitFor(() => expect(spendInput()).toHaveValue('830'));

    await user.clear(spendInput());
    await user.type(spendInput(), 'a1b2.c3');

    expect(spendInput()).toHaveValue('123');
  });

  it('changes the projection when the monthly spend changes', async () => {
    const { user } = await openForecast();
    await waitFor(() => expect(spendInput()).toHaveValue('830'));
    const projection = () => screen.getByText('ONE YEAR PROJECTION').parentElement!.textContent;
    const before = projection();

    await user.clear(spendInput());
    await user.type(spendInput(), '2000');

    expect(projection()).not.toEqual(before);
  });

  it('renders the monthly projection table', async () => {
    await openForecast();

    expect(screen.getByText('Balance Projection')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });
});
