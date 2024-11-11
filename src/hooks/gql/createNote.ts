import { useMutation } from '@apollo/client';
import { useErrorHandler } from '../errorHandler';
import { CREATE_NOTE_MUTATION, addNoteCache } from '~/graphql';
import { useSnackbar, useUserContext } from '~/state';
import { Note } from '~/types';

export const useCreateNote = () => {
  const { user } = useUserContext();
  const { enqueueSnackbar } = useSnackbar();
  const handleGQLError = useErrorHandler();

  const [createNote, { loading }] = useMutation(CREATE_NOTE_MUTATION);

  const createNewNote = ({ note }: { note: Note }) => {
    createNote({
      variables: { note },
      update: (cache, { data: { createNote } }) => addNoteCache(cache, createNote.note, user),
      onCompleted: () => {
        enqueueSnackbar('Note created', { variant: 'success' });
      },
      onError: handleGQLError
    });
  };

  return { createNewNote, loading };
};
