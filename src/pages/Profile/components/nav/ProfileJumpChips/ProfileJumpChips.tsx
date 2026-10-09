import { SECTIONS } from '../../../profileModel';
import { ProfileNavProps, jumpProps } from '../profileJump';

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
