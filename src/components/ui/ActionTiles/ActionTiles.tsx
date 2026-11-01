import { ReactNode } from 'react';

/* A quick view's big buttons, two to a row */
export const ActionTiles = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-2">{children}</div>
);
