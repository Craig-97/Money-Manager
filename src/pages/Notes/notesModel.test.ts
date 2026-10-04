import { describe, expect, it } from 'vitest';
import { charactersLeft, findNotes, Note, noteMeta, notePreview, toNotes } from './notesModel';

const at = (iso: string) => Date.parse(iso);

const notes: Note[] = [
  {
    id: 'a',
    body: 'Pay the plumber',
    color: 'BLUE',
    created: at('2024-12-09T10:00:00'),
    updated: at('2024-12-09T18:00:00')
  },
  {
    id: 'b',
    body: 'Cancel the gym',
    color: 'GREEN',
    created: at('2024-12-09T12:00:00'),
    updated: at('2024-12-09T12:00:00')
  },
  {
    id: 'c',
    body: 'Plumber quote £120',
    color: 'ROSE',
    created: at('2024-12-09T08:00:00'),
    updated: at('2024-12-09T09:00:00')
  }
];

const ids = (list: Note[]) => list.map(note => note.id);

describe('findNotes', () => {
  it('sorts by when notes were made or changed', () => {
    expect(ids(findNotes(notes, '', 'newest'))).toEqual(['b', 'a', 'c']);
    expect(ids(findNotes(notes, '', 'oldest'))).toEqual(['c', 'a', 'b']);
    expect(ids(findNotes(notes, '', 'updated'))).toEqual(['a', 'b', 'c']);
    expect(ids(findNotes(notes, '', 'updatedOldest'))).toEqual(['c', 'b', 'a']);
  });

  it('matches the search text anywhere, ignoring case', () => {
    expect(ids(findNotes(notes, '  PLUMBER ', 'newest'))).toEqual(['a', 'c']);
    expect(findNotes(notes, 'rent', 'newest')).toEqual([]);
  });
});

describe('note text', () => {
  it('dates a note and says when it has been edited', () => {
    expect(noteMeta(notes[0])).toBe('9 Dec 2024 · Edited');
    expect(noteMeta(notes[1])).toBe('9 Dec 2024');
  });

  it('previews the start of the first line', () => {
    expect(notePreview('Test Note\n\nDo Da Dee')).toBe('Test Note');
    expect(notePreview('x'.repeat(40))).toHaveLength(30);
  });

  it('counts the characters left, warning near the limit', () => {
    expect(charactersLeft('')).toEqual({
      left: 200,
      label: '200 characters remaining',
      low: false
    });
    expect(charactersLeft('x'.repeat(199))).toEqual({
      left: 1,
      label: '1 character remaining',
      low: true
    });
  });
});

describe('toNotes', () => {
  it('reads epoch and ISO timestamps from the API', () => {
    const [note] = toNotes([
      {
        __typename: 'Note',
        id: 'n',
        body: 'Hi',
        color: 'AMBER',
        createdAt: '1733738400000',
        updatedAt: '2024-12-09T10:00:00.000Z'
      }
    ]);
    expect(note.created).toBe(1733738400000);
    expect(note.updated).toBe(Date.parse('2024-12-09T10:00:00.000Z'));
  });
});
