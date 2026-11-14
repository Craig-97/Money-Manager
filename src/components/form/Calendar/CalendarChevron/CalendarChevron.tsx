import { ChevronLeft, ChevronRight } from 'lucide-react';

/* The month arrows, in the app's icons */
export const CalendarChevron = ({
  orientation
}: {
  orientation?: 'left' | 'right' | 'up' | 'down';
}) =>
  orientation === 'left' ? (
    <ChevronLeft size={18} aria-hidden="true" />
  ) : (
    <ChevronRight size={18} aria-hidden="true" />
  );
