import { useState } from 'react';
import { NoteColor } from '~/graphql/generated';
import { charactersLeft, NOTE_MAX_LENGTH } from '../notesModel';

/* The text and colour being written in the composer or while editing a note */
export const useNoteDraft = (initial: { body?: string; color?: NoteColor } = {}) => {
  const [body, setBody] = useState(initial.body ?? '');
  const [color, setColor] = useState<NoteColor>(initial.color ?? 'BLUE');
  const [saving, setSaving] = useState(false);

  return {
    body,
    setBody: (text: string) => setBody(text.slice(0, NOTE_MAX_LENGTH)),
    color,
    setColor,
    empty: body.trim().length === 0,
    count: charactersLeft(body),
    saving,
    /* Saves the trimmed text; clears the draft if it worked */
    save: async (onSave: (draft: { body: string; color: NoteColor }) => Promise<boolean>) => {
      const text = body.trim();
      if (!text || saving) return false;
      setSaving(true);
      const saved = await onSave({ body: text, color });
      setSaving(false);
      if (saved) setBody('');
      return saved;
    }
  };
};

export type NoteDraftState = ReturnType<typeof useNoteDraft>;
