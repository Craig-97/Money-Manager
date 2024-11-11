import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { DELETE_NOTE_MUTATION, deleteNoteCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { useUserContext } from '~/state';

export const useDeleteNote = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [deleteNote, { loading }] = useMutation(DELETE_NOTE_MUTATION);

  const deleteSelectedNote = ({ noteId }: { noteId: string }) => {
    deleteNote({
      variables: { id: noteId },
      update: (cache, { data: { deleteNote } }) => deleteNoteCache(cache, deleteNote.note, user),
      onCompleted: () => {
        enqueueSnackbar('Note deleted', { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { deleteSelectedNote, loading };
};
