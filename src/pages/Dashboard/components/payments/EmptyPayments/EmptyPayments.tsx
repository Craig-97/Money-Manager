import { Calendar, Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { PaymentTab } from '../../../dashboardModel';
import { EMPTY_TEXT } from '../paymentText';

export const EmptyPayments = ({ tab, onAdd }: { tab: PaymentTab; onAdd: () => void }) => (
  <div className="flex flex-col items-center gap-1.5 border-t border-border px-3 pt-7 pb-6 text-center md:px-4 md:pt-9 md:pb-8">
    <span
      aria-hidden="true"
      className="mb-2 inline-flex size-[52px] items-center justify-center rounded-[18px] bg-accent-soft text-accent-text">
      <Calendar size={24} />
    </span>
    <p className="text-base font-extrabold tracking-[-0.01em]">{EMPTY_TEXT[tab].title}</p>
    <p className="mb-2.5 text-[13px] font-medium text-muted">{EMPTY_TEXT[tab].body}</p>
    <Button variant="accent" onClick={onAdd}>
      <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
      {EMPTY_TEXT[tab].button}
    </Button>
  </div>
);
