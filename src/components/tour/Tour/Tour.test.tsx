import { afterEach, describe, expect, it } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import { useTourStore } from '~/state/tour';
import { apiDateFromToday } from '~/test/dates';
import { createFakeApi, DEFAULT_USER, freshBudget } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

// Started today, so there's no payday prompt waiting
const api = ({ tourSeen }: { tourSeen: boolean }) =>
  createFakeApi({
    user: { ...DEFAULT_USER, tourSeen },
    budget: freshBudget({ cycleStartedOn: apiDateFromToday(0) })
  });

const card = (title: string) => screen.findByRole('dialog', { name: title });

afterEach(resetViewport);

describe('the welcome', () => {
  it('is offered to someone new on the dashboard, and starts the tour', async () => {
    const { api: fake, user } = renderApp({ route: '/dashboard', api: api({ tourSeen: false }) });

    const welcome = await screen.findByRole('dialog', { name: 'You’re all set up' });
    await user.click(within(welcome).getByRole('button', { name: 'Show me around' }));

    expect(await card('Free to spend')).toHaveTextContent('1 of 12');
    expect(fake.callsTo('MarkTourSeen')).toHaveLength(1);
  });

  it('says where to find the tour when turned down', async () => {
    const { api: fake, user } = renderApp({ route: '/dashboard', api: api({ tourSeen: false }) });

    const welcome = await screen.findByRole('dialog', { name: 'You’re all set up' });
    await user.click(within(welcome).getByRole('button', { name: 'I’ll explore on my own' }));

    expect(await screen.findByText('Replay it any time from Profile')).toBeInTheDocument();
    expect(fake.callsTo('MarkTourSeen')).toHaveLength(1);
    expect(screen.queryByRole('dialog', { name: 'Free to spend' })).not.toBeInTheDocument();
  });

  it('is not offered again once seen', async () => {
    renderApp({ route: '/dashboard', api: api({ tourSeen: true }) });

    expect(await screen.findByRole('article', { name: 'Free to spend' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'You’re all set up' })).not.toBeInTheDocument();
  });
});

describe('the tour', () => {
  const startTour = async () => {
    const rendered = renderApp({ route: '/dashboard', api: api({ tourSeen: true }) });
    await screen.findByRole('article', { name: 'Free to spend' });
    act(() => useTourStore.getState().start());
    await card('Free to spend');
    return rendered;
  };

  it('goes forward and back, showing an example payday prompt on its way', async () => {
    const { user } = await startTour();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await card('Days to payday')).toHaveTextContent('2 of 12');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await card('On payday');
    // Made-up payments, so it has something in it whatever Setup had
    expect(document.querySelector('[data-tour="payday-example"]')).toHaveTextContent('Phone');

    await user.click(screen.getByRole('button', { name: 'Back' }));
    await card('Days to payday');
    expect(document.querySelector('[data-tour="payday-example"]')).not.toBeInTheDocument();
  });

  it('ends with Done, saying where to replay it', async () => {
    const { user } = await startTour();

    for (let step = 1; step < 12; step++) {
      await user.click(screen.getByRole('button', { name: 'Next' }));
    }
    await card('Profile');
    await user.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Profile' })).not.toBeInTheDocument()
    );
    expect(await screen.findByText('Replay it any time from Profile')).toBeInTheDocument();
  });

  it('can be skipped at any stop', async () => {
    const { user } = await startTour();

    await user.click(screen.getByRole('button', { name: 'Skip tour' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Free to spend' })).not.toBeInTheDocument()
    );
    expect(useTourStore.getState().step).toBeNull();
  });

  it('shows More’s pages on a phone for the pages under More', async () => {
    setViewportWidth(375);
    await startTour();

    act(() => useTourStore.getState().goTo(7));

    expect(await card('Accounts')).toHaveTextContent('8 of 12');
    expect(document.querySelector('[data-tour="more-sheet"]')).toHaveTextContent('Debts');
  });

  it('is replayed from Help on Profile', async () => {
    const { user, router } = renderApp({ route: '/profile', api: api({ tourSeen: true }) });

    await user.click(await screen.findByRole('button', { name: 'Replay tour' }));

    expect(await card('Free to spend')).toHaveTextContent('1 of 12');
    expect(router.state.location.pathname).toBe('/dashboard');
  });
});
