import { screen, waitFor, within } from '@testing-library/react';
import { renderApp } from '~/test/renderApp';

const openNotes = async () => {
  const app = renderApp({ route: '/notes' });
  await screen.findByText('Buy milk');
  return app;
};

// Note texts in the order they are displayed
const noteOrder = () =>
  screen
    .getAllByText(/Buy milk|Call the bank|Pay the gas bill|Renew insurance/)
    .map(element => element.textContent);

const iconButton = (testId: string, index = 0) =>
  screen.getAllByTestId(testId)[index].closest('button') as HTMLElement;

describe('Notes page', () => {
  it('lists notes newest first', async () => {
    await openNotes();

    expect(noteOrder()).toEqual(['Call the bank', 'Buy milk']);
    expect(screen.getByText('1 Feb 2024')).toBeInTheDocument();
    expect(screen.getByText('1 Jan 2024')).toBeInTheDocument();
  });

  it('sorts notes oldest first', async () => {
    const { user } = await openNotes();

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Oldest' }));

    expect(noteOrder()).toEqual(['Buy milk', 'Call the bank']);
  });

  it('filters notes by search text', async () => {
    const { user } = await openNotes();

    await user.type(screen.getByPlaceholderText('Search notes...'), 'milk');

    expect(noteOrder()).toEqual(['Buy milk']);
    expect(screen.queryByText('Call the bank')).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText('Search notes...'));
    expect(noteOrder()).toEqual(['Call the bank', 'Buy milk']);
  });
});

describe('Creating a note', () => {
  it('adds a note and closes the new note card', async () => {
    const { user, api } = await openNotes();

    await user.click(screen.getByRole('button', { name: 'Add Note' }));
    const field = screen.getByPlaceholderText('Start typing your note here...');
    await user.type(field, 'Pay the gas bill');
    expect(screen.getByText('184 characters remaining')).toBeInTheDocument();
    await user.click(iconButton('CheckOutlinedIcon'));

    expect(await screen.findByText('Pay the gas bill')).toBeInTheDocument();
    expect(api.callsTo('CreateNote')).toEqual([
      { note: { account: 'account-1', body: 'Pay the gas bill' } }
    ]);
    expect(screen.queryByPlaceholderText('Start typing your note here...')).not.toBeInTheDocument();
    expect(await screen.findByText('Note created')).toBeInTheDocument();
  });

  it('does not save an empty note', async () => {
    const { user, api } = await openNotes();

    await user.click(screen.getByRole('button', { name: 'Add Note' }));
    await user.type(screen.getByPlaceholderText('Start typing your note here...'), '   ');

    expect(iconButton('CheckOutlinedIcon')).toBeDisabled();
    expect(api.callsTo('CreateNote')).toHaveLength(0);
  });

  it('limits notes to 200 characters', async () => {
    const { user } = await openNotes();

    await user.click(screen.getByRole('button', { name: 'Add Note' }));
    const field = screen.getByPlaceholderText('Start typing your note here...');
    await user.click(field);
    await user.paste('a'.repeat(205));

    expect(field).toHaveValue('');
    await user.clear(field);
    await user.paste('a'.repeat(200));
    expect(field).toHaveValue('a'.repeat(200));
    expect(screen.getByText('0 characters remaining')).toBeInTheDocument();
  });

  it('closes the new note card without saving', async () => {
    const { user, api } = await openNotes();

    await user.click(screen.getByRole('button', { name: 'Add Note' }));
    await user.type(screen.getByPlaceholderText('Start typing your note here...'), 'Draft');
    await user.click(iconButton('CloseOutlinedIcon'));

    expect(screen.queryByPlaceholderText('Start typing your note here...')).not.toBeInTheDocument();
    expect(api.callsTo('CreateNote')).toHaveLength(0);
  });
});

describe('Editing and deleting a note', () => {
  it('edits a note in place', async () => {
    const { user, api } = await openNotes();

    // The first card is "Call the bank"
    await user.click(iconButton('EditOutlinedIcon', 0));
    const field = screen.getByDisplayValue('Call the bank');
    await user.clear(field);
    await user.type(field, 'Renew insurance');
    await user.click(iconButton('CheckOutlinedIcon'));

    expect(await screen.findByText('Renew insurance')).toBeInTheDocument();
    expect(screen.queryByText('Call the bank')).not.toBeInTheDocument();
    expect(api.callsTo('EditNote')[0]).toMatchObject({ id: 'note-2' });
  });

  it('restores the original text when editing is cancelled', async () => {
    const { user, api } = await openNotes();

    await user.click(iconButton('EditOutlinedIcon', 0));
    const field = screen.getByDisplayValue('Call the bank');
    await user.clear(field);
    await user.type(field, 'Something else');
    await user.click(iconButton('CloseOutlinedIcon'));

    expect(screen.getByText('Call the bank')).toBeInTheDocument();
    await user.click(iconButton('EditOutlinedIcon', 0));
    expect(screen.getByDisplayValue('Call the bank')).toBeInTheDocument();
    expect(api.callsTo('EditNote')).toHaveLength(0);
  });

  it('deletes a note', async () => {
    const { user, api } = await openNotes();

    await user.click(iconButton('DeleteOutlinedIcon', 1));

    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
    expect(api.callsTo('DeleteNote')).toEqual([{ id: 'note-1' }]);
    expect(within(document.body).getByText('Call the bank')).toBeInTheDocument();
  });
});

describe('Note error handling', () => {
  const ERROR = 'Something went wrong on the server';

  it('keeps the new note card open and shows the error when creating fails', async () => {
    const { user, api } = await openNotes();
    api.failNext('CreateNote', 'SERVER_ERROR', ERROR);

    await user.click(screen.getByRole('button', { name: 'Add Note' }));
    await user.type(
      screen.getByPlaceholderText('Start typing your note here...'),
      'Pay the gas bill'
    );
    await user.click(iconButton('CheckOutlinedIcon'));

    expect(await screen.findByText(ERROR)).toBeInTheDocument();
    expect(api.db.account!.notes).toHaveLength(2);
    expect(screen.getByPlaceholderText('Start typing your note here...')).toHaveValue(
      'Pay the gas bill'
    );
  });

  it('keeps the original note and shows the error when editing fails', async () => {
    const { user, api } = await openNotes();
    api.failNext('EditNote', 'SERVER_ERROR', ERROR);

    await user.click(iconButton('EditOutlinedIcon', 0));
    const field = screen.getByDisplayValue('Call the bank');
    await user.clear(field);
    await user.type(field, 'Renew insurance');
    await user.click(iconButton('CheckOutlinedIcon'));

    expect(await screen.findByText(ERROR)).toBeInTheDocument();
    expect(api.db.account!.notes.find(n => n.id === 'note-2')!.body).toBe('Call the bank');
  });

  it('keeps the note and shows the error when deleting fails', async () => {
    const { user, api } = await openNotes();
    api.failNext('DeleteNote', 'SERVER_ERROR', ERROR);

    await user.click(iconButton('DeleteOutlinedIcon', 1));

    expect(await screen.findByText(ERROR)).toBeInTheDocument();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(api.db.account!.notes).toHaveLength(2);
  });
});
