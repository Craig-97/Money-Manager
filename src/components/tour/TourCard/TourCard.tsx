import { Ref } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '~/lib/cn';
import { Button } from '../../ui';
import { TourStep } from '../tourSteps';

interface TourCardProps {
  step: TourStep;
  index: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  nextRef: Ref<HTMLButtonElement>;
}

/* What a stop of the tour says, with the way on: Back, Next (Done at the end) and Skip tour */
export const TourCard = ({
  step,
  index,
  total,
  onBack,
  onNext,
  onSkip,
  nextRef
}: TourCardProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-2">
      <span className="num text-xs font-extrabold tracking-[0.04em] text-accent-text">
        {index + 1} of {total}
      </span>
      <Button
        variant="ghost"
        size="md"
        onClick={onSkip}
        className="-my-1.5 -mr-2.5 h-9 px-3 text-[13px]">
        Skip tour
      </Button>
    </div>
    <Dialog.Title className="text-[19px] font-extrabold tracking-[-0.02em]">
      {step.title}
    </Dialog.Title>
    <Dialog.Description className="text-sm leading-[1.5] font-medium text-muted">
      {step.text}
    </Dialog.Description>
    <div className="mt-1 flex items-center justify-between gap-2">
      <div aria-hidden="true" className="flex flex-wrap items-center gap-[5px]">
        {Array.from({ length: total }, (_, dot) => (
          <span
            key={dot}
            className={cn(
              'h-1.5 rounded-full',
              dot === index ? 'w-[18px] bg-accent' : 'w-1.5 bg-track'
            )}
          />
        ))}
      </div>
      <div className="flex shrink-0 gap-2">
        {index > 0 ? <Button onClick={onBack}>Back</Button> : null}
        <Button ref={nextRef} variant="accent" onClick={onNext}>
          {index === total - 1 ? 'Done' : 'Next'}
        </Button>
      </div>
    </div>
  </div>
);
