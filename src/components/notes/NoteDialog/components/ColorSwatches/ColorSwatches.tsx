import { cn } from '~/lib/cn';
import { NOTE_COLORS } from '~/lib/notes';
import { NoteDraftState } from '../../useNoteDraft';

interface ColorSwatchesProps {
  draft: NoteDraftState;
  // Names the group from a visible label, as the note dialog's "Colour"
  labelledBy?: string;
}

/* The five colours, as a row of dots */
export const ColorSwatches = ({ draft, labelledBy }: ColorSwatchesProps) => (
  <div
    role="group"
    {...(labelledBy ? { 'aria-labelledby': labelledBy } : { 'aria-label': 'Note colour' })}
    className="flex gap-2">
    {NOTE_COLORS.map(color => {
      const on = color.value === draft.color;
      return (
        <button
          key={color.value}
          type="button"
          aria-label={`${color.label} tag`}
          aria-pressed={on}
          onClick={() => draft.set('color', color.value)}
          className="group inline-flex size-11 cursor-pointer items-center justify-center rounded-full">
          <span
            className={cn(
              'block size-6 rounded-full transition-[box-shadow,transform] group-hover:scale-110',
              color.dot,
              on && color.surfaceRing
            )}
          />
        </button>
      );
    })}
  </div>
);
