import { cn } from '~/lib/cn';
import { NoteDraftState } from '../../../hooks';
import { NOTE_COLORS } from '../../../notesModel';

/* The five colours, as a row of dots */
export const ColorSwatches = ({ draft }: { draft: NoteDraftState }) => (
  <div role="group" aria-label="Note colour" className="flex">
    {NOTE_COLORS.map(color => {
      const on = color.value === draft.color;
      return (
        <button
          key={color.value}
          type="button"
          aria-label={`${color.label} tag`}
          aria-pressed={on}
          onClick={() => draft.setColor(color.value)}
          className="group inline-flex h-11 w-8 cursor-pointer items-center justify-center rounded-full">
          <span
            className={cn(
              'block size-5 rounded-full transition-[box-shadow,transform] group-hover:scale-110',
              color.dot,
              on && color.ring
            )}
          />
        </button>
      );
    })}
  </div>
);
