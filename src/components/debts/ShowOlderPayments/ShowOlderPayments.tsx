import { ChevronDown } from 'lucide-react';
import { Button } from '~/components/ui/Button';

interface ShowOlderPaymentsProps {
  onClick: () => void;
  loading: boolean;
}

/* Under a debt's payments when there are older ones than are showing */
export const ShowOlderPayments = ({ onClick, loading }: ShowOlderPaymentsProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    loading={loading}
    loadingText="Loading…"
    className="self-center text-[13px] text-accent-text">
    <ChevronDown size={16} aria-hidden="true" />
    Show older payments
  </Button>
);
