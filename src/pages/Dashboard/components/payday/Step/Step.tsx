import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { StepNumber } from '../StepNumber';

const stepTitleClasses =
  'flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-0.01em] md:block md:pt-[5px] md:text-base';

interface StepProps {
  number: number;
  title: string;
  // A muted line under the title, e.g. "Where you get paid"
  subtitle?: string;
  // The title labels this input
  titleFor?: string;
  children: ReactNode;
}

/* A numbered step: the number sits beside the title on mobile, in its own column on desktop */
export const Step = ({ number, title, subtitle, titleFor, children }: StepProps) => {
  const heading = (
    <>
      <StepNumber className="md:hidden">{number}</StepNumber>
      {subtitle ? (
        <span className="flex flex-col gap-0.5 max-md:pt-1">
          {title}
          <span className="text-xs font-semibold tracking-normal text-muted md:text-[13px]">
            {subtitle}
          </span>
        </span>
      ) : (
        title
      )}
    </>
  );
  return (
    <div className="md:grid md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4">
      <StepNumber className="hidden md:inline-flex">{number}</StepNumber>
      <div className="min-w-0">
        {titleFor ? (
          <label
            htmlFor={titleFor}
            className={cn(stepTitleClasses, subtitle && 'items-start md:flex')}>
            {heading}
          </label>
        ) : (
          <p className={cn(stepTitleClasses, subtitle && 'items-start md:flex')}>{heading}</p>
        )}
        {children}
      </div>
    </div>
  );
};
