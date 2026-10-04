import { ComponentType, ReactNode } from 'react';
import { IconProps } from '~/components/icons';
import { cn } from '~/lib/cn';

interface AuthResultProps {
  icon: ComponentType<IconProps>;
  title: string;
  description: ReactNode;
  // success: an accent tick or envelope; problem: a red badge, e.g. for an expired link
  tone?: 'success' | 'problem';
  // Shown under the description, e.g. the resend card
  children?: ReactNode;
  // The buttons: at the bottom of the screen on mobile, under the text on desktop
  actions: ReactNode;
}

/* What a form turns into once it's done: a big icon, a heading and what to do next */
export const AuthResult = ({
  icon: Icon,
  title,
  description,
  tone = 'success',
  children,
  actions
}: AuthResultProps) => (
  <div
    role={tone === 'problem' ? 'alert' : 'status'}
    className="flex flex-1 flex-col items-start gap-3 px-0.5 pt-3 md:flex-none md:gap-3.5 md:p-0">
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-[60px] items-center justify-center rounded-full md:size-16',
        tone === 'success' ? 'bg-accent text-on-accent' : 'bg-expense-bg text-expense'
      )}>
      <Icon className="size-7 md:size-[30px]" />
    </span>
    <h1 className="mt-2 text-[32px] leading-[1.05] font-extrabold tracking-[-0.045em] md:text-[40px]">
      {title}
    </h1>
    <p className="text-[15px] leading-[1.55] font-medium text-muted md:text-base">{description}</p>
    {children}
    <div className="mt-auto flex w-full flex-col gap-2.5 pt-3 md:mt-3 md:pt-0">{actions}</div>
  </div>
);
