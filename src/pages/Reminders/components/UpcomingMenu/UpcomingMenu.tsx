import { ReactNode } from 'react';
import { BellOff, BellRing, Clock, ExternalLink } from 'lucide-react';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '~/components/ui/Menu';
import { Reminder } from '~/lib/reminders';
import { RemindersPage } from '../../hooks';

interface UpcomingMenuProps {
  reminder: Reminder;
  page: RemindersPage;
  // The button that opens it
  children: ReactNode;
}

/* A Coming up row's actions: open what it's about, change when it reminds, or turn it off */
export const UpcomingMenu = ({ reminder, page, children }: UpcomingMenuProps) => {
  const open = page.openFrom(reminder);
  const toggle = page.toggleOf(reminder);

  return (
    <Menu>
      <MenuTrigger>{children}</MenuTrigger>
      <MenuContent aria-label={`Actions for ${reminder.name}`}>
        {open ? (
          <MenuItem icon={<ExternalLink size={16} aria-hidden="true" />} onSelect={open.run}>
            {open.label}
          </MenuItem>
        ) : null}
        {page.canChangeWhen(reminder) ? (
          <MenuItem
            icon={<Clock size={16} aria-hidden="true" />}
            onSelect={() => page.changeWhen(reminder)}>
            Change when
          </MenuItem>
        ) : null}
        {toggle ? (
          <MenuItem
            icon={
              toggle.on ? (
                <BellOff size={16} aria-hidden="true" />
              ) : (
                <BellRing size={16} aria-hidden="true" />
              )
            }
            onSelect={toggle.run}>
            {toggle.on ? 'Turn off this reminder' : 'Turn on this reminder'}
          </MenuItem>
        ) : null}
      </MenuContent>
    </Menu>
  );
};
