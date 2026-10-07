import { useRef } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '~/lib/cn';
import { NoteDraftState } from '../../hooks';
import { NOTE_COLORS, NOTE_MAX_LENGTH, noteColor } from '../../notesModel';

const noteButton =
  'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent';

/* The five colours, as a row of dots */
const ColorSwatches = ({ draft }: { draft: NoteDraftState }) => (
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

interface NoteFormProps {
  id: string;
  draft: NoteDraftState;
  // Names the form and its text box: "New note" or "Edit note"
  label: string;
  saveLabel: string;
  cancelLabel: string;
  placeholder?: string;
  onSave: () => Promise<boolean>;
  onCancel: () => void;
  // Called after a save, e.g. to put the cursor back for the next note
  onSaved?: () => void;
  className?: string;
}

/*
 * Writing a note: the text, a colour, the characters left, and save and cancel. Used for new
 * notes and for editing one in place. Ctrl/⌘+Enter saves, Escape cancels.
 */
export const NoteForm = ({
  id,
  draft,
  label,
  saveLabel,
  cancelLabel,
  placeholder,
  onSave,
  onCancel,
  onSaved,
  className
}: NoteFormProps) => {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const countId = `${id}-count`;

  const submit = async () => {
    if (await onSave()) {
      onSaved?.();
      textRef.current?.focus();
    }
  };

  return (
    <form
      aria-label={label}
      onSubmit={event => {
        event.preventDefault();
        void submit();
      }}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onCancel();
        } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          void submit();
        }
      }}
      className={cn(
        'flex min-h-[200px] flex-col gap-3.5 rounded-[22px] border p-[18px] md:h-[190px] md:min-h-0 md:gap-4 md:rounded-3xl md:p-[22px]',
        noteColor(draft.color).card,
        className
      )}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        ref={textRef}
        id={id}
        rows={4}
        // Typing straight into the note is what opening it is for
        autoFocus
        maxLength={NOTE_MAX_LENGTH}
        placeholder={placeholder}
        value={draft.body}
        onChange={event => draft.setBody(event.target.value)}
        onFocus={event => {
          const end = event.currentTarget.value.length;
          event.currentTarget.setSelectionRange(end, end);
        }}
        aria-describedby={countId}
        className="min-h-0 w-full grow resize-none border-0 bg-transparent p-0 text-base leading-[1.55] font-medium text-text outline-none placeholder:text-faint"
      />
      <div className="-mx-2.5 -mb-2.5 -ml-2 flex items-center gap-0.5 border-t border-border-strong pt-1">
        <ColorSwatches draft={draft} />
        <span
          id={countId}
          title={draft.count.label}
          aria-label={draft.count.label}
          className={cn(
            'min-w-0 grow pr-1 text-right num text-xs font-semibold',
            draft.count.low ? 'text-expense' : 'text-muted'
          )}>
          {draft.count.left}
        </span>
        <button
          type="submit"
          aria-label={saveLabel}
          disabled={draft.empty || draft.saving}
          className={cn(noteButton, 'text-accent-text hover:text-accent-text')}>
          <Check size={20} strokeWidth={2.25} aria-hidden="true" />
        </button>
        <button type="button" aria-label={cancelLabel} onClick={onCancel} className={noteButton}>
          <X size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};
