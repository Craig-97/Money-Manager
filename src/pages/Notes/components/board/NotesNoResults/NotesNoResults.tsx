import { SearchX } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { StatePanel } from '../StatePanel';

export const NotesNoResults = ({ query, onClear }: { query: string; onClear: () => void }) => (
  <StatePanel
    icon={<SearchX size={22} />}
    title={`No notes match “${query.trim()}”`}
    action={
      <Button variant="default" onClick={onClear} className="border-border-strong bg-transparent">
        Clear search
      </Button>
    }
  />
);
