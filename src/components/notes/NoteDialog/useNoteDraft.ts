import { useState } from 'react';
import {
  BLANK_DRAFT,
  charactersLeft,
  DEFAULT_NOTE_REMIND,
  NOTE_MAX_LENGTH,
  NoteDraft
} from '~/lib/notes';

/* The note being written or changed in the note dialog */
export const useNoteDraft = (initial: NoteDraft = BLANK_DRAFT) => {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof NoteDraft>(key: K, value: NoteDraft[K]) =>
    setDraft(current => {
      const next = { ...current, [key]: value };
      // A first date reminds a week before until other reminders are picked
      if (key === 'date' && value && !current.date && !current.remind.length) {
        next.remind = DEFAULT_NOTE_REMIND;
      }
      return next;
    });

  return {
    ...draft,
    draft,
    set,
    setBody: (text: string) => set('body', text.slice(0, NOTE_MAX_LENGTH)),
    empty: draft.body.trim().length === 0,
    count: charactersLeft(draft.body),
    saving,
    /* Starts again from a note, or blank */
    reset: (start: NoteDraft = BLANK_DRAFT) => setDraft(start),
    /* Saves it with the text trimmed. The draft stays as it is, so the dialog shows it while it closes. */
    save: async (onSave: (draft: NoteDraft) => Promise<boolean>) => {
      const body = draft.body.trim();
      if (!body || saving) return false;
      setSaving(true);
      const saved = await onSave({ ...draft, body });
      setSaving(false);
      return saved;
    }
  };
};

export type NoteDraftState = ReturnType<typeof useNoteDraft>;
