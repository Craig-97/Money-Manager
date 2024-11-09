import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { CREATE_NOTE_MUTATION, addNoteCache } from '~/graphql';
import { useSnackbar } from '~/state';
import { Note, User } from '~/types';

interface CreateNoteParams {
  note: Note;
  user: User;
}

export const useCreateNote = () => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();
  const [createNote, { loading }] = useMutation(CREATE_NOTE_MUTATION);

  const createNewNote = ({ note, user }: CreateNoteParams) => {
    createNote({
      variables: { note },
      update: (
        cache,
        {
          data: {
            createNote: { note }
          }
        }
      ) => addNoteCache(cache, note, user),
      onError: handleGQLError,
      onCompleted: () => {
        enqueueSnackbar('Note created successfully!', { variant: 'success' });
      }
    });
  };

  return { createNewNote, loading };
};
