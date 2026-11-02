import { Repeat } from 'lucide-react';

/* The schedule in one line: "Next due Sat 24 Oct · renews 24 Oct 2027", or what's still needed */
export const ScheduleSummary = ({ text }: { text: string }) => (
  <div
    role="status"
    className="flex items-start gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
    <Repeat size={16} strokeWidth={2.25} className="mt-px shrink-0" aria-hidden="true" />
    <span>{text}</span>
  </div>
);
