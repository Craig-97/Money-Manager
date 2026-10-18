import { NoteColor } from '~/graphql/generated';

export const NOTE_MAX_LENGTH = 200;
// The counter turns red with this many characters left
const NOTE_LOW_LENGTH = 20;

interface NoteColorStyle {
  value: NoteColor;
  label: string;
  // The card's tint and border
  card: string;
  dot: string;
  // The ring round the chosen swatch, on the note dialog's surface
  surfaceRing: string;
}

// Written out in full so Tailwind can find every class
export const NOTE_COLORS: readonly NoteColorStyle[] = [
  {
    value: 'BLUE',
    label: 'Blue',
    card: 'border-note-blue-line bg-note-blue',
    dot: 'bg-note-blue-dot',
    surfaceRing: 'shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--n-blue-dot)]'
  },
  {
    value: 'GREEN',
    label: 'Green',
    card: 'border-note-green-line bg-note-green',
    dot: 'bg-note-green-dot',
    surfaceRing: 'shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--n-green-dot)]'
  },
  {
    value: 'AMBER',
    label: 'Amber',
    card: 'border-note-amber-line bg-note-amber',
    dot: 'bg-note-amber-dot',
    surfaceRing: 'shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--n-amber-dot)]'
  },
  {
    value: 'ROSE',
    label: 'Rose',
    card: 'border-note-rose-line bg-note-rose',
    dot: 'bg-note-rose-dot',
    surfaceRing: 'shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--n-rose-dot)]'
  },
  {
    value: 'VIOLET',
    label: 'Violet',
    card: 'border-note-violet-line bg-note-violet',
    dot: 'bg-note-violet-dot',
    surfaceRing: 'shadow-[0_0_0_3px_var(--surface),0_0_0_5px_var(--n-violet-dot)]'
  }
];

export const noteColor = (value: NoteColor) =>
  NOTE_COLORS.find(color => color.value === value) ?? NOTE_COLORS[0];

export const charactersLeft = (text: string) => {
  const left = NOTE_MAX_LENGTH - text.length;
  return {
    left,
    label: `${left} ${left === 1 ? 'character' : 'characters'} remaining`,
    low: left <= NOTE_LOW_LENGTH
  };
};
