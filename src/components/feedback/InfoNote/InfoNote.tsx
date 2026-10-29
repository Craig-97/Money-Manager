import { ReactNode } from 'react';
import { Info, LucideIcon } from 'lucide-react';
import { cn } from '~/lib/cn';

interface InfoNoteProps {
  children: ReactNode;
  // Info unless the note is about something more specific, like a move or a restore
  icon?: LucideIcon;
  // Read out when the text changes, for notes that follow a choice above them
  live?: boolean;
  className?: string;
}

/*
 * A short grey note that explains something on the page. The icon is always the accent and bold
 * text is the text colour, so every note in the app looks the same.
 */
export const InfoNote = ({
  children,
  icon: Icon = Info,
  live = false,
  className
}: InfoNoteProps) => (
  <p
    aria-live={live ? 'polite' : undefined}
    className={cn(
      'flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-muted [&_b]:font-bold [&_b]:text-text',
      className
    )}>
    <Icon size={16} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
    <span>{children}</span>
  </p>
);
