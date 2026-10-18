import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { createFakeApi, DEFAULT_ACCOUNT, FakeAccount } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

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

  it('adds a note in the chosen colour, from a dialog', async () => {
    const { user, api } = renderNotes();
    await board();

    // The toolbar's button; the mobile nav has one too, hidden by CSS on desktop
    const [toolbarAdd] = screen.getAllByRole('button', { name: 'Add note' });
    await user.click(toolbarAdd);
    const dialog = await screen.findByRole('dialog', { name: 'New note' });
    const text = within(dialog).getByLabelText('Note');
    await waitFor(() => expect(text).toHaveFocus());
    expect(within(dialog).getByRole('button', { name: 'Save note' })).toBeDisabled();
    // Nothing to delete yet
    expect(within(dialog).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

    await user.type(text, 'Renew the car insurance');
    expect(within(dialog).getByLabelText('177 characters remaining')).toBeInTheDocument();
    await user.click(
      within(within(dialog).getByRole('group', { name: 'Colour' })).getByRole('button', {
        name: 'Green tag'
      })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save note' }));

    expect(await screen.findByText('Renew the car insurance')).toBeInTheDocument();
    expect(api.callsTo('CreateNote')).toEqual([
      { input: { accountId: 'account-1', body: 'Renew the car insurance', color: 'GREEN' } }
    ]);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'New note' })).toBeNull());

    // Each new note starts blank
    await user.click(toolbarAdd);
    expect(
      within(await screen.findByRole('dialog', { name: 'New note' })).getByLabelText('Note')
    ).toHaveValue('');
  });

  it('saves with Ctrl+Enter', async () => {
    const { user, api } = renderNotes();
    await board();

    const [toolbarAdd] = screen.getAllByRole('button', { name: 'Add note' });
    await user.click(toolbarAdd);
    const dialog = await screen.findByRole('dialog', { name: 'New note' });
    await user.type(
      within(dialog).getByLabelText('Note'),
      'Ring the bank{Control>}{Enter}{/Control}'
    );

    await waitFor(() => expect(api.callsTo('CreateNote')).toHaveLength(1));
  });

  it('edits a note in a dialog, starting from its text and colour', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Edit note: Pay the plumber' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit note' });
    const text = within(dialog).getByLabelText('Note');
    expect(text).toHaveValue('Pay the plumber');
    expect(within(dialog).getByRole('button', { name: 'Rose tag' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await user.clear(text);
    await user.type(text, 'Pay the electrician');
    await user.click(within(dialog).getByRole('button', { name: 'Save note' }));

    expect(await screen.findByText('Pay the electrician')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit note' })).toBeNull());
    expect(api.callsTo('UpdateNote')).toEqual([
      { id: 'plumber', input: { body: 'Pay the electrician', color: 'ROSE' } }
    ]);
  });

  it('closes an edit without sending anything when the note is unchanged', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Edit note: Buy milk' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit note' });
    await user.click(within(dialog).getByRole('button', { name: 'Save note' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit note' })).toBeNull());
    expect(api.callsTo('UpdateNote')).toEqual([]);
  });

  it('throws away changes on Cancel', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Edit note: Buy milk' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit note' });
    await user.type(within(dialog).getByLabelText('Note'), ' and bread');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit note' })).toBeNull());
    expect(api.callsTo('UpdateNote')).toEqual([]);
    // Opening it again starts from the note, not what was typed
    await user.click(screen.getByRole('button', { name: 'Edit note: Buy milk' }));
    expect(
      within(await screen.findByRole('dialog', { name: 'Edit note' })).getByLabelText('Note')
    ).toHaveValue('Buy milk');
  });

  it('deletes a note from its dialog', async () => {
    const { user, api } = renderNotes();
    await board();

    await user.click(screen.getByRole('button', { name: 'Edit note: Buy milk' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit note' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Note deleted')).toBeInTheDocument();
    expect(api.callsTo('DeleteNote')).toEqual([{ id: 'milk' }]);
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
      { input: { accountId: 'account-1', body: 'Buy milk', color: 'BLUE' } }
    ]);
  });

  it('invites a first note when there are none', async () => {
    const { user } = renderNotes(account({ notes: [] }));

    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
    const add = screen.getAllByRole('button', { name: 'Add note' });
    await user.click(add[add.length - 1]);

    expect(await screen.findByRole('dialog', { name: 'New note' })).toBeInTheDocument();
  });
});

describe('notes on mobile', () => {
  beforeEach(() => setViewportWidth(390));
  afterEach(resetViewport);

  it('starts a new note from the add button in the nav, ready to type', async () => {
    const { user } = renderNotes();
    await board();

    // The sidebar is in the page too, hidden by CSS on mobile
    const nav = screen
      .getAllByRole('navigation', { name: 'Main' })
      .find(element => within(element).queryByRole('button', { name: 'Add note' }))!;
    await user.click(within(nav).getByRole('button', { name: 'Add note' }));

    // A bottom sheet on mobile
    const sheet = await screen.findByRole('dialog', { name: 'New note' });
    const text = within(sheet).getByLabelText('Note');
    await waitFor(() => expect(text).toHaveFocus());
    await user.type(text, 'Book the MOT');
    expect(text).toHaveValue('Book the MOT');
  });
});
