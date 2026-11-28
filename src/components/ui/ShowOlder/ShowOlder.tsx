import { ChevronDown } from 'lucide-react';
import { Button } from '../Button';

interface ShowOlderProps {
  // "Show older payments"
  label: string;
  onClick: () => void;
  loading: boolean;
}

/* Under a history on a phone when there are older ones than are showing */
export const ShowOlder = ({ label, onClick, loading }: ShowOlderProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    loading={loading}
    loadingText="Loading…"
    className="self-center text-[13px] text-accent-text">
    <ChevronDown size={16} aria-hidden="true" />
    {label}
  </Button>
);
