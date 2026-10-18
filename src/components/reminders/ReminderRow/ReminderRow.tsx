import { PointerEvent, useRef, useState } from 'react';
import { ChevronDown, Clock, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { ReminderOpen } from '~/hooks/useReminderOpen';
import { cn } from '~/lib/cn';
import { canClear, firedText, Reminder } from '~/lib/reminders';
import { ReminderIcon } from '../ReminderIcon';

interface ReminderRowProps {
  reminder: Reminder;
  today: Date;
  open: ReminderOpen | null;
  onLater: () => void;
  onClear: () => void;
}

// How wide each action behind the row is
const ACTION_WIDTH = 76;
// Movement under this is a tap, not a swipe
const TAP_SLOP = 6;

/*
 * A reminder on mobile: swipe it left for Later and Clear, or tap it to see what it says and what
 * to do about it. The actions behind it can be reached with the keyboard too, which slides it open.
 *
 * A tap opens it on the click, not when the finger lifts. Opening it makes the bell's sheet taller,
 * which moves the row under the finger, and a phone's click comes after the finger lifts: opened
 * any earlier, that click would land on whatever had moved under it, like Mark as paid.
 */
export const ReminderRow = ({ reminder, today, open, onLater, onClear }: ReminderRowProps) => {
  const clearable = canClear(reminder);
  const actionsWidth = ACTION_WIDTH * (clearable ? 2 : 1);
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null);
  // Set when a swipe ends, so the click a mouse drag ends with isn't taken as a tap. A finger's
  // swipe ends with no click, so it's cleared when the next touch starts rather than left to
  // swallow the next tap.
  const swiped = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    swiped.current = false;
    drag.current = { x: event.clientX, from: offset, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (!start.moved && Math.abs(dx) < TAP_SLOP) return;
    if (!start.moved) {
      start.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setOffset(Math.min(0, Math.max(-actionsWidth, start.from + dx)));
  };
  const onPointerUp = () => {
    const start = drag.current;
    drag.current = null;
    setDragging(false);
    if (!start?.moved) return;
    swiped.current = true;
    // Snaps open past halfway, shut otherwise
    setOffset(current => (current < -actionsWidth / 2 ? -actionsWidth : 0));
  };
  // A tap (or Enter or Space) shuts it if it's swiped open, otherwise shows or hides the rest
  const onClick = () => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    if (offset !== 0) setOffset(0);
    else setExpanded(current => !current);
  };
  // The actions behind it only work once it's swiped open, or reached with the keyboard
  const whenOpen = (action: () => void) => () => {
    if (offset !== 0) action();
  };

  const reveal = () => setOffset(-actionsWidth);
  const fired = firedText(reminder, today);

  return (
    <li className="relative overflow-hidden rounded-[18px]">
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex focus-within:opacity-100',
          // Shut, they can't be tapped through the row; only the keyboard reaches them, which slides it open
          offset === 0 && !dragging && 'pointer-events-none opacity-0'
        )}
        style={{ width: actionsWidth }}>
        <button
          type="button"
          onClick={whenOpen(onLater)}
          onFocus={reveal}
          className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 bg-accent text-xs font-bold text-on-accent">
          <Clock size={18} strokeWidth={2.25} aria-hidden="true" />
          Later
          <span className="sr-only">: {reminder.title}</span>
        </button>
        {clearable ? (
          <button
            type="button"
            onClick={whenOpen(onClear)}
            onFocus={reveal}
            className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 bg-expense text-xs font-bold text-white">
            <X size={18} strokeWidth={2.5} aria-hidden="true" />
            Clear
            <span className="sr-only">: {reminder.title}</span>
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'relative z-1 bg-surface',
          !dragging && 'transition-transform duration-200 ease-out'
        )}
        style={{ transform: `translateX(${offset}px)` }}>
        <button
          type="button"
          aria-expanded={expanded}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={onClick}
          className={cn(
            'flex min-h-[72px] w-full cursor-pointer touch-pan-y items-center gap-3.5 px-3 py-3 text-left select-none',
            !reminder.read && 'bg-surface-2'
          )}>
          <ReminderIcon reminder={reminder} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px] font-bold">
              {reminder.title}
              {reminder.read ? null : <span className="sr-only"> (new)</span>}
            </span>
            <span
              className={cn(
                'num text-xs font-semibold',
                reminder.kind === 'overdue' ? 'text-expense' : 'text-muted'
              )}>
              {fired}
            </span>
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={cn('shrink-0 text-muted transition-transform', expanded && 'rotate-180')}
          />
        </button>
        {expanded ? (
          <div className={cn('px-3 pb-3.5 pl-[70px]', !reminder.read && 'bg-surface-2')}>
            <p className="text-sm leading-[1.45] font-medium text-muted">{reminder.body}</p>
            <div className="mt-3 -ml-1 flex flex-wrap gap-1.5">
              {open ? (
                <Button onClick={open.run} className="h-10 px-3.5 text-[13px] font-bold">
                  {open.label}
                </Button>
              ) : null}
              {open?.also ? (
                <Button onClick={open.also.run} className="h-10 px-3.5 text-[13px] font-bold">
                  {open.also.label}
                </Button>
              ) : null}
              <Button variant="ghost" onClick={onLater} className="h-10 px-3 text-[13px]">
                Later
              </Button>
              {clearable ? (
                <Button variant="ghost" onClick={onClear} className="h-10 px-3 text-[13px]">
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
};
