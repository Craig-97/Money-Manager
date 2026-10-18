import { cn } from '~/lib/cn';

interface ProgressRingProps {
  // 0 to 1
  share: number;
  size?: number;
  className?: string;
}

/* How much is paid off, as a ring with the percentage in the middle */
export const ProgressRing = ({ share, size = 96, className }: ProgressRingProps) => {
  const percent = Math.round(Math.min(Math.max(share, 0), 1) * 100);
  const stroke = size >= 80 ? 10 : 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <span
      role="img"
      aria-label={`${percent}% paid off`}
      style={{ width: size, height: size }}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}>
      <svg width={size} height={size} aria-hidden="true" className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="fill-none stroke-accent [stroke-linecap:round]"
        />
      </svg>
      <span className={cn('relative num font-extrabold', size >= 80 ? 'text-xl' : 'text-[13px]')}>
        {percent}%
      </span>
    </span>
  );
};
