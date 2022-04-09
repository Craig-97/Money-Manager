import { Fragment } from 'react';
import { Account, Note } from '../../types';
import { useAccountContext } from '../../state';
import { NewNoteCard } from './NewNote';
import { NoteCard } from './Note';

export const Notes = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { notes }: Account = account;

  return (
    <Fragment>
      <h4 className="notes-header">Notes</h4>
      <div className="notes">
        <NewNoteCard />
        {notes?.map(({ id, body, createdAt }: Note) => {
          return <NoteCard key={id} id={id} body={body} createdAt={createdAt} />;
        })}
      </div>
    </Fragment>
  );
};
