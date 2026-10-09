import { FileText, Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { StatePanel } from '../StatePanel';

export const NotesEmpty = ({ onAdd }: { onAdd: () => void }) => (
  <StatePanel
    icon={<FileText size={22} />}
    title="No notes yet"
    text="Add a quick reminder to keep alongside your money."
    action={
      <Button variant="accent" onClick={onAdd} className="font-bold">
        <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
        Add note
      </Button>
    }
  />
);
