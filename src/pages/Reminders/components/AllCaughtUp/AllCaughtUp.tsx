import { CheckCheck } from 'lucide-react';
import { Tile } from '~/components/ui/Tile';

/* Nothing in New */
export const AllCaughtUp = () => (
  <Tile flat aria-label="New reminders" className="items-center gap-2 py-12 text-center md:gap-2">
    <span
      aria-hidden="true"
      className="mb-2 inline-flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
      <CheckCheck size={22} />
    </span>
    <h2 className="text-base font-bold">You’re all caught up</h2>
    <p className="max-w-[320px] text-sm font-medium text-muted">
      Reminders show here when they go off. See what’s next under Coming up.
    </p>
  </Tile>
);
