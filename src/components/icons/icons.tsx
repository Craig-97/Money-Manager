import { ReactNode, SVGProps } from 'react';

// Icons drawn in the design that lucide doesn't match exactly. Same 24px grid and stroke style.

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

const Svg = ({
  size = 20,
  strokeWidth = 2,
  children,
  ...props
}: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}>
    {children}
  </svg>
);

/* Four tiles. The mobile nav draws them with rounder corners. */
export const DashboardIcon = ({
  cornerRadius = 1.5,
  ...props
}: IconProps & { cornerRadius?: number }) => (
  <Svg {...props}>
    <rect x="3" y="3" width="7" height="9" rx={cornerRadius} />
    <rect x="14" y="3" width="7" height="5" rx={cornerRadius} />
    <rect x="14" y="12" width="7" height="9" rx={cornerRadius} />
    <rect x="3" y="16" width="7" height="5" rx={cornerRadius} />
  </Svg>
);

export const ForecastIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Svg>
);

export const NotesIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h5" />
  </Svg>
);

export const ProfileIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);

export const MoonIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);
