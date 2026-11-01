import { formatBalance } from '~/lib/format';

/* "Free to spend £7,907.50 → £8,152.50": what the change does, before it's saved */
export const SpendChange = ({ before, after }: { before: number; after: number }) => (
  <p
    role="status"
    className="flex items-center justify-between gap-2.5 rounded-[18px] bg-accent-soft px-4 py-3 text-[13px] leading-[1.4] font-bold text-accent-text">
    <span>Free to spend</span>
    <span className="num">
      <s className="font-semibold opacity-70">{formatBalance(before)}</s> → {formatBalance(after)}
    </span>
  </p>
);
