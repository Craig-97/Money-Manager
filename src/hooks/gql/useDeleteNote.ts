import { useMutation } from '@apollo/client/react';
import { useErrorHandler } from '../useErrorHandler';
import { DELETE_NOTE_MUTATION, deleteNoteCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { useUserContext } from '~/state';
import { Note } from '~/types';

interface DeleteNoteResult {
  deleteNote: {
    note: Note;
  };
}

export const useDeleteNote = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [deleteNote, { loading }] = useMutation<DeleteNoteResult>(DELETE_NOTE_MUTATION);

  const deleteSelectedNote = ({ noteId }: { noteId: string }) => {
    deleteNote({
      variables: { id: noteId },
      update: (cache, { data }) => {
        const note = data?.deleteNote?.note;
        if (!note) return;
        deleteNoteCache(cache, note, user);
      },
      onCompleted: () => {
        enqueueSnackbar('Note deleted', { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { deleteSelectedNote, loading };
};
