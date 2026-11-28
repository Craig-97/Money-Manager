import { ReactNode } from 'react';

/* The rows under a quick view's tiles, lined up with the tiles' edges */
export const ActionRows = ({ children }: { children: ReactNode }) => (
  <div className="-mx-1 flex flex-col">{children}</div>
);
