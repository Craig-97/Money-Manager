import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '~/lib/cn';
import { useMoreSubtitles } from './useMoreSubtitles';
import { MoreLink } from '../MoreMenu/moreLinks';

interface MoreSheetProps {
  links: MoreLink[];
  current: MoreLink | undefined;
  onNavigate: () => void;
}

/* More's pages, each with a line saying what's there. The page that's showing is highlighted. */
export const MoreSheet = ({ links, current, onNavigate }: MoreSheetProps) => {
  const subtitles = useMoreSubtitles();

  return (
    <nav aria-label="More pages" className="flex flex-col">
      {links.map(({ to, label, page, Icon }) => {
        const here = page === current?.page;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={here ? 'page' : undefined}
            className={cn(
              '-mx-2.5 flex min-h-16 items-center gap-3 rounded-[18px] px-2.5 text-text no-underline transition-colors',
              here ? 'bg-accent-soft' : 'hover:bg-hover'
            )}>
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border text-accent-text',
                here ? 'bg-surface' : 'bg-surface-2'
              )}>
              <Icon size={18} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-bold">{label}</span>
              {subtitles[page] ? (
                <span className="truncate text-xs font-semibold text-muted">{subtitles[page]}</span>
              ) : null}
            </span>
            <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
};
