import { Check, X } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { MoneyEditor } from '../../hooks';

/* The monthly income field while it's being edited: Enter saves, Escape cancels */
export const IncomeEditor = ({ editor, id }: { editor: MoneyEditor; id: string }) => (
  <>
    <div className="flex h-14 items-center gap-0.5 rounded-full border-[1.5px] border-accent bg-surface-2 pr-1 pl-4 shadow-[0_0_0_4px_var(--accent-soft)]">
      <label htmlFor={id} className="num text-xl font-extrabold text-muted">
        £
      </label>
      <input
        id={id}
        autoFocus
        inputMode="decimal"
        value={editor.draft}
        onChange={event => editor.setDraft(event.target.value)}
        onKeyDown={editor.onKeyDown}
        aria-label="Monthly income"
        aria-describedby={`${id}-hint`}
        className="w-full min-w-0 flex-1 border-0 bg-transparent px-1 num text-xl leading-none font-extrabold tracking-[-0.03em] text-text outline-none"
      />
      <button
        type="button"
        aria-label="Save monthly income"
        onClick={editor.commit}
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-on-accent hover:brightness-110">
        <Check size={18} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <IconButton aria-label="Cancel editing monthly income" onClick={editor.cancel}>
        <X size={18} strokeWidth={2.25} aria-hidden="true" />
      </IconButton>
    </div>
    <p id={`${id}-hint`} className="text-xs font-medium text-muted">
      Press{' '}
      <kbd className="inline-flex h-5 items-center rounded-md border border-border-strong bg-surface-2 px-1.5 text-[11px] font-bold text-text">
        Enter
      </kbd>{' '}
      to save
    </p>
  </>
);
