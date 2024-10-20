import { NewNoteCard, NoteCard, StandardPage } from '~/components';
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
        {notes?.map(({ id, ...rest }: Note) => {
          return <NoteCard key={id} id={id} {...rest} />;
        })}
      </div>
    </StandardPage>
  );
};
