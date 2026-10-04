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

export const ArrowRightIcon = (props: IconProps) => (
  <Svg strokeWidth={2.25} {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ClockIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const LockIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="4" y="10.5" width="16" height="10" rx="3" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    <path d="M12 14.5v2" />
  </Svg>
);

export const KeyIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M17 6l3 3M15 8l2 2" />
  </Svg>
);

export const ShieldCheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const BrokenLinkIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    <path d="M4 4l2 2M20 20l-2-2" />
  </Svg>
);

export const MailIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M4 7.5l8 5.5 8-5.5" />
  </Svg>
);

export const ResendIcon = (props: IconProps) => (
  <Svg strokeWidth={2.25} {...props}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 5v6h-6" />
  </Svg>
);

export const CalendarIcon = (props: IconProps) => (
  <Svg strokeWidth={2.25} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

/* A banknote, for payday */
export const PaydayIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2" y="6" width="20" height="13" rx="3" />
    <circle cx="12" cy="12.5" r="2.5" />
    <path d="M6 10v5M18 10v5" />
  </Svg>
);

export const SquareCheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M8 12l3 3 5-6" />
  </Svg>
);

export const CheckIcon = (props: IconProps) => (
  <Svg strokeWidth={2.5} {...props}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);
