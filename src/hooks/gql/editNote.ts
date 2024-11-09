import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { EDIT_NOTE_MUTATION } from '~/graphql';
import { useSnackbar } from '~/state';

interface UseEditNoteProps {
  onSuccess?: () => void;
}

export const useEditNote = ({ onSuccess }: UseEditNoteProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();
  const [editNote, { loading }] = useMutation(EDIT_NOTE_MUTATION);

  const editSelectedNote = (id: string, body: string) => {
    editNote({
      variables: { id, note: { body } },
      onCompleted: () => {
        enqueueSnackbar('Note updated', { variant: 'success' });
        onSuccess?.();
      },
      onError: handleGQLError
    });
  };

  return { editSelectedNote, loading };
};
