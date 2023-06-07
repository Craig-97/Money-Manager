import { NewNoteCard, NoteCard } from '~/components/Notes';
import { StandardPage } from '~/components/StandardPage';
import { useAccountContext } from '~/state';
import { AccountState, Note } from '~/types';

export const Notes = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { notes }: AccountState = account;

  return (
    <StandardPage>
      <h4 className="notes-header">Notes</h4>
      <div className="notes">
        <NewNoteCard />
        {notes?.map(({ id, body, createdAt }: Note) => {
          return <NoteCard key={id} id={id} body={body} createdAt={createdAt} />;
        })}
      </div>
    </StandardPage>
  );
};
