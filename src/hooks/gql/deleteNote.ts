import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { DELETE_NOTE_MUTATION, deleteNoteCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { User } from '~/types';

interface UseDeleteNoteProps {
  user: User;
  onSuccess?: () => void;
}

export const useDeleteNote = ({ user, onSuccess }: UseDeleteNoteProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();
  const [deleteNote, { loading }] = useMutation(DELETE_NOTE_MUTATION);

  const deleteSelectedNote = (id: string) => {
    deleteNote({
      variables: { id },
      update: (
        cache,
        {
          data: {
            deleteNote: { note }
          }
        }
      ) => deleteNoteCache(cache, note, user),
      onCompleted: () => {
        enqueueSnackbar('Note deleted', { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { deleteSelectedNote, loading };
};
