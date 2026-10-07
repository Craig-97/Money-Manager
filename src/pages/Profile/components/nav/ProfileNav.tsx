import { LogOut } from 'lucide-react';
import { SectionId, SECTIONS } from '../../profileModel';
import { SECTION_ICONS } from '../sections/sectionIcons';

interface ProfileNavProps {
  current: SectionId;
  onJump: (id: SectionId) => void;
  onLogout: () => void;
}

// Jumps without changing the URL's hash, which the router would treat as a navigation
const jumpProps = (id: SectionId, current: SectionId, onJump: (id: SectionId) => void) => ({
  href: `#${id}`,
  'aria-current': id === current ? ('location' as const) : undefined,
  onClick: (event: React.MouseEvent) => {
    event.preventDefault();
    onJump(id);
  }
});

/* The sections down the side, on wide screens */
export const ProfileNav = ({ current, onJump, onLogout }: ProfileNavProps) => (
  <nav
    aria-label="Profile sections"
    className="sticky top-6 hidden flex-col gap-1 rounded-3xl border border-border bg-surface p-2.5 wide:flex">
    <p className="px-3.5 pt-2 pb-1.5 text-[11px] font-extrabold tracking-[0.08em] text-faint uppercase">
      Settings
    </p>
    {SECTIONS.map(section => (
      <a
        key={section.id}
        {...jumpProps(section.id, current, onJump)}
        className="flex h-11 items-center gap-3 rounded-full px-3.5 text-sm font-semibold text-muted no-underline transition-colors hover:bg-hover hover:text-text aria-[current]:bg-accent-soft aria-[current]:font-bold aria-[current]:text-text [&[aria-current]>svg]:text-accent-text">
        {SECTION_ICONS[section.id]}
        {section.label}
      </a>
    ))}
    <div className="mx-3.5 my-2 h-px bg-border" />
    <button
      type="button"
      onClick={onLogout}
      className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-full px-3.5 text-left text-sm font-semibold text-muted transition-colors hover:bg-expense-bg hover:text-expense">
      <LogOut size={18} aria-hidden="true" />
      Log out
    </button>
  </nav>
);

/* The sections as a row of chips that scrolls sideways, on mobile */
export const ProfileJumpChips = ({ current, onJump }: Omit<ProfileNavProps, 'onLogout'>) => (
  <nav
    aria-label="Profile sections"
    className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto overflow-y-hidden px-4 py-1">
    {SECTIONS.map(section => (
      <a
        key={section.id}
        {...jumpProps(section.id, current, onJump)}
        className="inline-flex h-11 shrink-0 items-center rounded-full border border-border bg-surface px-4 text-[13px] font-bold text-muted no-underline aria-[current]:border-transparent aria-[current]:bg-pill-active-bg aria-[current]:text-pill-active-text">
        {section.short}
      </a>
    ))}
  </nav>
);
