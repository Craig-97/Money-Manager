import { Tile } from '~/components/ui/Tile';
import { RemindersPage } from '../../hooks';
import { MobileUpcomingRow } from '../MobileUpcomingRow';
import { UpcomingRow } from '../UpcomingRow';

/*
 * Coming up, grouped a month at a time and then by year: one tile on desktop, a card for each
 * group on mobile.
 */
export const UpcomingList = ({ page, mobile }: { page: RemindersPage; mobile: boolean }) => {
  if (!page.groups.length) {
    return (
      <Tile flat aria-label="Coming up">
        <p className="py-8 text-center text-sm font-medium text-muted">
          {page.filter === 'all' ? 'Nothing coming up yet.' : 'Nothing like that coming up.'}
        </p>
      </Tile>
    );
  }

  if (mobile) {
    return (
      <div aria-label="Coming up" role="region" className="flex flex-col gap-2">
        {page.groups.map(group => (
          <section
            key={group.label}
            aria-labelledby={`up-${group.label}`}
            className="flex flex-col gap-2">
            <h2
              id={`up-${group.label}`}
              className="mt-1.5 px-1 text-xs font-extrabold tracking-[0.08em] text-muted uppercase">
              {group.label}
            </h2>
            <ul className="flex flex-col rounded-3xl border border-border bg-surface p-2">
              {group.reminders.map(reminder => (
                <MobileUpcomingRow key={reminder.key} reminder={reminder} page={page} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <Tile flat aria-label="Coming up" className="gap-1 p-3 md:gap-1 md:p-3">
      {page.groups.map(group => (
        <section key={group.label} aria-labelledby={`up-${group.label}`}>
          <h2
            id={`up-${group.label}`}
            className="px-3 pt-3 pb-1.5 text-xs font-extrabold tracking-[0.08em] text-muted uppercase">
            {group.label}
          </h2>
          <ul className="flex flex-col">
            {group.reminders.map(reminder => (
              <UpcomingRow key={reminder.key} reminder={reminder} page={page} />
            ))}
          </ul>
        </section>
      ))}
    </Tile>
  );
};
