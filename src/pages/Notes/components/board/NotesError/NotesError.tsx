import { RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { StatePanel } from '../StatePanel';

export const NotesError = ({ onRetry }: { onRetry: () => void }) => (
  <StatePanel
    tone="error"
    icon={<TriangleAlert size={22} />}
    title="Couldn’t load your notes"
    text="The server didn’t respond, so your notes aren’t showing."
    action={
      <Button variant="default" onClick={onRetry} className="border-border-strong bg-transparent">
        <RefreshCw size={16} strokeWidth={2.25} aria-hidden="true" />
        Try again
      </Button>
    }
  />
);
