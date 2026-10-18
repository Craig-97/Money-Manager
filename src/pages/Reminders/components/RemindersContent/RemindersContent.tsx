import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Button } from '~/components/ui/Button';
import { ChipGroup } from '~/components/ui/ChipGroup';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Tile } from '~/components/ui/Tile';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { RemindersPage } from '../../hooks';
import { countText, FILTERS, RemindersTab } from '../../remindersModel';
import { AddChooser } from '../AddChooser';
import { CalendarPromo } from '../CalendarPromo';
import { HowYoullHear } from '../HowYoullHear';
import { NewList } from '../NewList';
import { TimingDialog } from '../TimingDialog';
import { UpcomingList } from '../UpcomingList';
import { UsualTiming } from '../UsualTiming';

const linkButton = 'h-10 px-3 text-[13px] font-bold text-accent-text';

/*
 * New and Coming up behind tabs. On desktop, how reminders reach you and their usual timing sit
 * alongside; on mobile they're in a sheet from the header.
 */
export const RemindersContent = ({ page }: { page: RemindersPage }) => {
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const { hash } = useLocation();

  // The bell's settings button comes here to the usual timing
  useEffect(() => {
    if (hash === '#timing') document.getElementById('timing')?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const tabs = (
    <SegmentedControl<RemindersTab>
      aria-label="Show"
      value={page.tab}
      onValueChange={page.setTab}
      options={[
        { value: 'new', label: 'New', count: page.unread || undefined },
        { value: 'up', label: 'Coming up', count: isDesktop ? page.upcomingCount : undefined }
      ]}
      size={isDesktop ? 'lg' : 'sm'}
      fullWidth={!isDesktop}
      className={isDesktop ? undefined : '[&>button]:h-11'}
    />
  );

  const newTools = page.fresh.length ? (
    <span className="flex">
      {page.unread ? (
        <Button
          variant="ghost"
          onClick={() => page.actions.markRead(page.fresh)}
          className={linkButton}>
          Mark all read
        </Button>
      ) : null}
      <Button
        variant="ghost"
        onClick={() => void page.actions.clearAll(page.fresh)}
        className={linkButton}>
        Clear all
      </Button>
    </span>
  ) : null;

  const filters = (
    <ChipGroup
      type="single"
      aria-label="Show only"
      value={page.filter}
      onValueChange={page.setFilter}
      options={FILTERS}
    />
  );

  const list =
    page.tab === 'new' ? (
      <NewList page={page} mobile={!isDesktop} />
    ) : (
      <UpcomingList page={page} mobile={!isDesktop} />
    );

  const dialogs = (
    <>
      <TimingDialog page={page} />
      <AddChooser />
    </>
  );

  if (!isDesktop) {
    return (
      <>
        {tabs}
        {page.tab === 'new' && page.fresh.length ? (
          <div className="-mb-1 flex items-center justify-between px-1">
            <p className="text-xs font-extrabold tracking-[0.08em] text-muted uppercase">
              {countText(page.fresh.length)}
            </p>
            <span className="-mr-3">{newTools}</span>
          </div>
        ) : null}
        {page.tab === 'up' ? <div className="-mx-4 overflow-x-auto px-4">{filters}</div> : null}
        {list}
        <CalendarPromo />
        {dialogs}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {tabs}
        {page.tab === 'new' ? newTools : filters}
      </div>
      <div className="grid items-start gap-4 min-[68.75rem]:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {list}
        <div className="flex flex-col gap-4">
          <Tile flat aria-labelledby="hear-heading">
            <h2 id="hear-heading" className="text-[19px] font-extrabold tracking-[-0.02em]">
              How you’ll hear
            </h2>
            <HowYoullHear />
          </Tile>
          <Tile flat id="timing" aria-labelledby="timing-heading" className="scroll-mt-6">
            <h2 id="timing-heading" className="text-[19px] font-extrabold tracking-[-0.02em]">
              Usual timing
            </h2>
            <UsualTiming page={page} />
          </Tile>
        </div>
      </div>
      {dialogs}
    </>
  );
};
