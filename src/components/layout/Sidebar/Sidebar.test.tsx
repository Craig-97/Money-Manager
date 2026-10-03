import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { usePrefsStore } from '~/state/prefs';
import { useSidebarStore } from '~/state/sidebar';
import { renderApp } from '~/test/renderApp';
import { setViewportWidth } from '~/test/viewport';

const renderDashboard = async (width: number) => {
  setViewportWidth(width);
  const utils = renderApp({ route: '/dashboard' });
  await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
  return { ...utils, sidebar: screen.getByRole('complementary', { name: 'Sidebar' }) };
};

describe('Sidebar', () => {
  it('is expanded on wide screens and remembers being collapsed', async () => {
    const { user, sidebar } = await renderDashboard(1440);

    expect(within(sidebar).getByText('Money Manager')).toBeInTheDocument();
    expect(within(sidebar).getByText('View profile')).toBeInTheDocument();

    await user.click(within(sidebar).getByRole('button', { name: 'Collapse sidebar' }));

    expect(within(sidebar).queryByText('View profile')).not.toBeInTheDocument();
    expect(within(sidebar).getByRole('link', { name: 'Forecast' })).toBeInTheDocument();
    expect(useSidebarStore.getState().collapsed).toBe(true);
    expect(JSON.parse(localStorage.getItem('mm-sidebar')!).state).toEqual({ collapsed: true });
  });

  it('is the icon rail at 1100px and below, and opens over the content', async () => {
    const { user, sidebar } = await renderDashboard(1024);

    expect(within(sidebar).queryByText('View profile')).not.toBeInTheDocument();

    await user.click(within(sidebar).getByRole('button', { name: 'Expand sidebar' }));

    expect(within(sidebar).getByText('View profile')).toBeInTheDocument();
    // Opening it over the content isn't remembered
    expect(useSidebarStore.getState().collapsed).toBe(false);

    await user.keyboard('{Escape}');

    expect(within(sidebar).queryByText('View profile')).not.toBeInTheDocument();
  });

  it('closes the overlay after navigating', async () => {
    const { user, sidebar } = await renderDashboard(1024);

    await user.click(within(sidebar).getByRole('button', { name: 'Expand sidebar' }));
    await user.click(within(sidebar).getByRole('link', { name: 'Notes' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Notes' })).toBeInTheDocument();
    expect(within(sidebar).queryByText('View profile')).not.toBeInTheDocument();
  });

  it('follows the screen width as it changes', async () => {
    const { sidebar } = await renderDashboard(1440);

    act(() => setViewportWidth(900));
    expect(within(sidebar).queryByText('View profile')).not.toBeInTheDocument();

    act(() => setViewportWidth(1300));
    expect(within(sidebar).getByText('View profile')).toBeInTheDocument();
  });

  it('marks the current page', async () => {
    const { sidebar } = await renderDashboard(1440);

    expect(within(sidebar).getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(sidebar).getByRole('link', { name: 'Forecast' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('switches the theme and applies it to the document', async () => {
    const { user, sidebar } = await renderDashboard(1440);
    const themes = within(sidebar).getByRole('group', { name: 'Theme' });

    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(within(themes).getByRole('button', { name: 'Light' }));

    expect(within(themes).getByRole('button', { name: 'Light' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(usePrefsStore.getState().theme).toBe('light');
  });

  it('switches the theme from the icon rail', async () => {
    const { user, sidebar } = await renderDashboard(1024);

    await user.click(within(sidebar).getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(within(sidebar).getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  });

  it("shows the user's name and initials", async () => {
    const { sidebar } = await renderDashboard(1440);

    expect(
      within(sidebar).getByRole('link', { name: 'Test Account, open profile' })
    ).toHaveTextContent('TA');
  });
});
