import { useState } from 'react';
import { cn } from '~/lib/cn';

interface LetterIconProps {
  letter: string;
  // A logo to show instead, when there is one and it loads
  iconUrl?: string | null;
  // Its size and shape, the same for the letter and the logo
  className?: string;
  // The letter's own colours and border
  letterClassName?: string;
  // The logo wouldn't load, so the letter shows
  onError?: () => void;
}

/*
 * A payment's or account's logo, or its first letter when it has none or the logo won't load. The
 * outline is drawn over the logo's edge: a border or background behind it shows as a ring at the
 * corners.
 */
export const LetterIcon = ({
  letter,
  iconUrl,
  className,
  letterClassName,
  onError
}: LetterIconProps) => {
  // The link that wouldn't load, so a new one is still tried
  const [failed, setFailed] = useState<string>();
  const base = 'inline-flex shrink-0 items-center justify-center';

  if (iconUrl && iconUrl !== failed) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          base,
          'relative after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-border after:ring-inset',
          className
        )}>
        <img
          src={iconUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            setFailed(iconUrl);
            onError?.();
          }}
          className="size-full rounded-[inherit] object-contain"
        />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={cn(base, 'font-extrabold', letterClassName, className)}>
      {letter}
    </span>
  );
};
