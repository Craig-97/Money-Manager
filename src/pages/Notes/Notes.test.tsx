import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { createFakeApi, DEFAULT_ACCOUNT, FakeAccount } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const NOTE_TIME = String(Date.parse('2024-12-09T10:00:00'));

const account = (overrides: Partial<FakeAccount> = {}): FakeAccount => ({
  ...structuredClone(DEFAULT_ACCOUNT),
  notes: [
    { id: 'milk', body: 'Buy milk', color: 'BLUE', createdAt: NOTE_TIME, updatedAt: NOTE_TIME },
    {
      id: 'plumber',
      body: 'Pay the plumber',
      color: 'ROSE',
      createdAt: String(Number(NOTE_TIME) + 60_000),
      updatedAt: String(Number(NOTE_TIME) + 60_000)
    }
  ],
  ...overrides
});

const renderNotes = (data = account()) => {
  const api = createFakeApi({ account: data });
  return { ...renderApp({ route: '/notes', api }), api };
};

// Waits past the loading skeleton, which is labelled Notes too
const board = async () => {
  await screen.findByText('Buy milk');
  return screen.getByRole('region', { name: 'Notes' });
};

describe('notes', () => {
  it('lists the notes, newest first, and searches them', async () => {
    const { user } = renderNotes();

    const notes = await board();
    const bodies = within(notes)
      .getAllByRole('article')
      .map(note => note.querySelector('p')?.textContent);
    expect(bodies).toEqual(['Pay the plumber', 'Buy milk']);
    expect(within(notes).getAllByText('9 Dec 2024')).toHaveLength(2);

    await user.type(screen.getByLabelText('Search notes'), 'MILK');
    expect(within(notes).getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/matching “MILK”/)).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search notes'), 'shake');
    expect(screen.getByText('No notes match “MILKshake”')).toBeInTheDocument();

    // The search box has one too; this is the panel's
    const [, panelClear] = screen.getAllByRole('button', { name: 'Clear search' });
    await user.click(panelClear);
    expect(within(notes).getAllByRole('article')).toHaveLength(2);
  });

  it('adds a note in the chosen colour', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Add note' }));
    const form = screen.getByRole('form', { name: 'New note' });
    const text = within(form).getByLabelText('New note');
    expect(text).toHaveFocus();
    expect(within(form).getByRole('button', { name: 'Save note' })).toBeDisabled();

    await user.type(text, 'Renew the car insurance');
    expect(within(form).getByLabelText('177 characters remaining')).toBeInTheDocument();
    await user.click(within(form).getByRole('button', { name: 'Green tag' }));
    await user.click(within(form).getByRole('button', { name: 'Save note' }));

    expect(await screen.findByText('Renew the car insurance')).toBeInTheDocument();
    expect(api.callsTo('CreateNote')).toEqual([
      { note: { account: 'account-1', body: 'Renew the car insurance', color: 'GREEN' } }
    ]);
    // Ready for another
    expect(text).toHaveValue('');
  });

  it('edits a note in place', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Edit note: Buy milk' }));
    const form = screen.getByRole('form', { name: 'Edit note' });
    const text = within(form).getByLabelText('Edit note');
    await user.clear(text);
    await user.type(text, 'Buy oat milk');
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Buy oat milk')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Edit note' })).not.toBeInTheDocument();
    expect(api.callsTo('EditNote')).toEqual([
      { id: 'milk', note: { body: 'Buy oat milk', color: 'BLUE' } }
    ]);
  });

  it('closes an edit without sending anything when the note is unchanged', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Edit note: Buy milk' }));
    const form = screen.getByRole('form', { name: 'Edit note' });
    await user.click(within(form).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('form', { name: 'Edit note' })).toBeNull());
    expect(api.callsTo('EditNote')).toEqual([]);
  });

  it('deletes a note, with undo', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Delete note: Buy milk' }));

    expect(await screen.findByText('Note deleted')).toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    expect(api.callsTo('DeleteNote')).toEqual([{ id: 'milk' }]);

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(api.callsTo('CreateNote')).toEqual([
      { note: { account: 'account-1', body: 'Buy milk', color: 'BLUE' } }
    ]);
  });

  it('invites a first note when there are none', async () => {
    const { user } = renderNotes(account({ notes: [] }));

    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
    const add = screen.getAllByRole('button', { name: 'Add note' });
    await user.click(add[add.length - 1]);

    expect(screen.getByRole('form', { name: 'New note' })).toBeInTheDocument();
    expect(screen.queryByText('No notes yet')).not.toBeInTheDocument();
  });
});
