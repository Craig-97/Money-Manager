import { SectionId } from '../../profileModel';

export interface ProfileNavProps {
  current: SectionId;
  onJump: (id: SectionId) => void;
  onLogout: () => void;
}

// Jumps without changing the URL's hash, which the router would treat as a navigation
export const jumpProps = (id: SectionId, current: SectionId, onJump: (id: SectionId) => void) => ({
  href: `#${id}`,
  'aria-current': id === current ? ('location' as const) : undefined,
  onClick: (event: React.MouseEvent) => {
    event.preventDefault();
    onJump(id);
  }
});
