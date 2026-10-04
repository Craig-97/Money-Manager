import { ComponentType, ReactNode } from 'react';
import { IconProps } from '~/components/icons';
import { cn } from '~/lib/cn';

interface AuthHeadingProps {
  title: string;
  // The line under the title
  children?: ReactNode;
  // Shown in a tile above the title on desktop
  icon?: ComponentType<IconProps>;
  // Also show the icon on mobile
  iconOnMobile?: boolean;
}

/* The page's h1 and the line under it */
export const AuthHeading = ({ title, children, icon: Icon, iconOnMobile }: AuthHeadingProps) => (
  <div className="px-0.5 pt-1 md:p-0">
    {Icon ? (
      <span
        aria-hidden="true"
        className={cn(
          'mb-4 size-[52px] items-center justify-center rounded-[18px] bg-accent-soft text-accent-text md:mb-5 md:size-14 md:rounded-[20px]',
          iconOnMobile ? 'flex' : 'hidden md:flex'
        )}>
        <Icon className="size-6 md:size-[26px]" />
      </span>
    ) : null}
    <h1 className="text-[32px] leading-[1.05] font-extrabold tracking-[-0.045em] md:text-[40px]">
      {title}
    </h1>
    {children ? (
      <p className="mt-2 text-[15px] leading-normal font-medium text-muted md:mt-3 md:text-base">
        {children}
      </p>
    ) : null}
  </div>
);
