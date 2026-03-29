import { useMutation } from '@apollo/client/react';
import { useErrorHandler } from '../useErrorHandler';
import { CREATE_NOTE_MUTATION, addNoteCache } from '~/graphql';
import { useSnackbar, useUserContext } from '~/state';
import { Note } from '~/types';

interface CreateNoteParams {
  note: Note;
  onSuccess?: () => void;
}

interface CreateNoteResult {
  createNote: {
    note: Note;
  };
}

export const useCreateNote = () => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [createNote, { loading }] = useMutation<CreateNoteResult>(CREATE_NOTE_MUTATION);

  const createNewNote = ({ note, onSuccess }: CreateNoteParams) => {
    createNote({
      variables: { note },
      update: (cache, { data }) => {
        const note = data?.createNote?.note;
        if (!note) return;
        addNoteCache(cache, note, user);
      },
      onCompleted: () => {
        enqueueSnackbar('Note created', { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { createNewNote, loading };
};
