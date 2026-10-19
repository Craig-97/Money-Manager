import { Bell, CalendarDays, Copy, Info, Mail, RotateCcw } from 'lucide-react';
import { Checkbox } from '~/components/form/Checkbox';
import { ReminderWay, WayTag } from '~/components/reminders';
import { Button } from '~/components/ui/Button';
import { buttonVariants } from '~/components/ui/Button/buttonVariants';
import { Switch } from '~/components/ui/Switch';
import { Budget } from '~/hooks/useBudget';
import { cn } from '~/lib/cn';
import { FEED_INCLUDES, useCalendarFeed } from '../../../hooks';
import { SECTION_ICONS } from '../sectionIcons';
import { SettingsTile } from '../SettingsTile';

/*
 * How the app tells you about things: in the app, always, and a calendar feed your phone's
 * calendar subscribes to, so it alerts you with the app closed. Email comes later.
 */
export const RemindersSection = ({ budget }: { budget: Budget }) => {
  const calendar = useCalendarFeed(budget);
  const { feed, urls } = calendar;

  return (
    <SettingsTile
      id="reminders"
      icon={SECTION_ICONS.reminders}
      title="Reminders"
      description="How the app tells you about payments, renewals, note dates and paydays."
      mobileDescription="How the app tells you about what’s coming up.">
      <div
        className={cn(
          'flex flex-col gap-4 rounded-[22px] border p-4 md:p-5',
          calendar.on ? 'border-accent shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-border'
        )}>
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-accent-text">
            <CalendarDays size={18} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span id="feed-title" className="text-[15px] font-bold">
              Calendar feed
            </span>
            <span className="text-[13px] font-medium text-muted">
              A private link your calendar app checks for updates. Your phone does the alerting.
            </span>
          </span>
          <Switch
            aria-labelledby="feed-title"
            checked={calendar.on}
            onCheckedChange={on => (on ? calendar.turnOn() : calendar.turnOff())}
          />
        </div>

        {urls ? (
          <>
            <div className="flex gap-2">
              <p
                aria-label="Feed link, hidden"
                className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-2xl border border-border bg-surface-2 px-4 font-mono text-[13px] whitespace-nowrap text-muted">
                <span className="truncate">{urls.shown}</span>
              </p>
              <Button size="lg" onClick={() => void calendar.copy()} className="shrink-0 px-4">
                <Copy size={16} aria-hidden="true" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={urls.google}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ className: 'text-[13px] font-bold' })}>
                Add to Google Calendar
              </a>
              <a
                href={urls.webcal}
                className={buttonVariants({ className: 'text-[13px] font-bold' })}>
                Add to Apple Calendar
              </a>
              <a
                href={urls.outlook}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ className: 'text-[13px] font-bold' })}>
                Add to Outlook
              </a>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-[13px] font-bold text-muted">
                Put these in the calendar
              </legend>
              <div className="grid gap-x-6 sm:grid-cols-2">
                {FEED_INCLUDES.map(include => (
                  <label
                    key={include.value}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                    <Checkbox
                      checked={feed[include.value]}
                      onChange={() => calendar.toggle(include.value)}
                    />
                    {include.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <p className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-muted">
              <Info size={16} aria-hidden="true" className="mt-px shrink-0 text-accent-text" />
              <span>
                Events show names and dates, and amounts only if you tick them.{' '}
                <b className="font-bold text-text">Anyone with the link can see them</b>, so reset
                it if you share it by mistake.
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                <Checkbox
                  checked={feed.showAmounts}
                  onChange={() => calendar.toggle('showAmounts')}
                />
                Show amounts in event titles
              </label>
              <Button
                variant="dangerGhost"
                onClick={() => void calendar.reset()}
                loading={calendar.resetting}
                className="-mr-2">
                <RotateCcw size={16} aria-hidden="true" />
                Reset link
              </Button>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <ReminderWay
          size="md"
          icon={<Bell size={18} aria-hidden="true" />}
          title="In the app"
          text="The bell and dashboard alerts. Worked out each time you open the app, so there’s nothing to set up."
          end={<WayTag tone="on">On</WayTag>}
        />
        <ReminderWay
          size="md"
          muted
          icon={<Mail size={18} aria-hidden="true" />}
          title="Email"
          text="A morning email on days something’s due. Comes later, once the server can send email on a schedule."
          end={<WayTag tone="later">Later</WayTag>}
        />
      </div>
    </SettingsTile>
  );
};
