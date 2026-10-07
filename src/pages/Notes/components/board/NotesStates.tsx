import { ReactNode } from 'react';
import { FileText, Plus, RefreshCw, SearchX, TriangleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Skeleton } from '~/components/ui/Skeleton';
import { cn } from '~/lib/cn';
import { noteGridClasses } from './noteGridClasses';

// Second and third line widths, so the placeholders don't all look the same
const SKELETON_LINES = [
  ['w-[72%]', 'w-[46%]'],
  ['w-[56%]', 'w-[38%]'],
  ['w-[80%]', 'w-[46%]'],
  ['w-[64%]', 'w-[38%]'],
  ['w-[76%]', 'w-[46%]'],
  ['w-[52%]', 'w-[38%]']
];

/* The board's shape while the account loads */
export const NotesSkeleton = () => (
  <section aria-label="Notes" aria-busy="true" className={noteGridClasses}>
    <span role="status" className="sr-only">
      Loading your notes
    </span>
    {SKELETON_LINES.map(([second, third]) => (
      <div
        key={second}
        aria-hidden="true"
        className="flex min-h-[200px] flex-col gap-4 rounded-[22px] border border-border bg-surface p-[18px] md:h-[190px] md:min-h-0 md:rounded-3xl md:p-[22px]">
        <div className="flex grow flex-col gap-3 pt-[5px]">
          <Skeleton shape="pill" className="h-3.5 w-[88%]" />
          <Skeleton shape="pill" className={cn('h-3.5', second)} />
          <Skeleton shape="pill" className={cn('h-3.5', third)} />
        </div>
        <div className="flex h-11 items-center justify-between">
          <span className="flex items-center gap-2">
            <Skeleton shape="pill" className="size-2" />
            <Skeleton shape="pill" className="h-2.5 w-[88px]" />
          </span>
          <span className="flex gap-3.5 pr-1.5">
            <Skeleton className="size-[18px]" />
            <Skeleton className="size-[18px]" />
          </span>
        </div>
      </div>
    ))}
  </section>
);

interface StatePanelProps {
  icon: ReactNode;
  title: string;
  text?: string;
  action: ReactNode;
  tone?: 'dashed' | 'error';
}

const StatePanel = ({ icon, title, text, action, tone = 'dashed' }: StatePanelProps) => (
  <div
    role={tone === 'error' ? 'alert' : undefined}
    className={cn(
      'flex flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center',
      tone === 'error'
        ? 'border border-border bg-surface'
        : 'border border-dashed border-border-strong'
    )}>
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-12 items-center justify-center rounded-2xl',
        tone === 'error'
          ? 'bg-expense-bg text-expense'
          : 'border border-border bg-surface text-muted'
      )}>
      {icon}
    </span>
    <h2 className="text-base font-bold">{title}</h2>
    {text ? <p className="max-w-[320px] text-sm font-medium text-muted">{text}</p> : null}
    {action}
  </div>
);

export const NotesEmpty = ({ onAdd }: { onAdd: () => void }) => (
  <StatePanel
    icon={<FileText size={22} />}
    title="No notes yet"
    text="Add a quick reminder to keep alongside your money."
    action={
      <Button variant="accent" onClick={onAdd} className="font-bold">
        <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
        Add note
      </Button>
    }
  />
);

export const NotesNoResults = ({ query, onClear }: { query: string; onClear: () => void }) => (
  <StatePanel
    icon={<SearchX size={22} />}
    title={`No notes match “${query.trim()}”`}
    action={
      <Button variant="default" onClick={onClear} className="border-border-strong bg-transparent">
        Clear search
      </Button>
    }
  />
);

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
