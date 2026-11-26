import { useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '~/lib/cn';
import { useTourStore } from '~/state/tour';
import { showReplayToast } from '../showReplayToast';
import { TourCard } from '../TourCard';
import { TourDim } from '../TourDim';
import { TourMoreMenu } from '../TourMoreMenu';
import { TourStep } from '../tourSteps';
import { useTourLayout } from '../useTourLayout';

interface TourStopProps {
  step: TourStep;
  index: number;
  total: number;
  isDesktop: boolean;
}

/* One stop: the dim with what it's about lit up and outlined, and the card beside it */
export const TourStop = ({ step, index, total, isDesktop }: TourStopProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const layout = useTourLayout({ step, isDesktop, cardRef });
  const goTo = useTourStore(s => s.goTo);
  const stop = useTourStore(s => s.stop);

  const finish = () => {
    stop();
    showReplayToast();
  };
  const next = () => (index === total - 1 ? finish() : goTo(index + 1));

  return (
    <>
      {step.more ? <TourMoreMenu /> : null}
      <Dialog.Root open onOpenChange={open => (open ? undefined : finish())}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-100">
            <TourDim lit={layout.lit} />
          </Dialog.Overlay>
          {layout.outline ? (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed z-100 shadow-[0_0_0_3px_var(--accent),0_0_0_8px_var(--accent-soft)]"
              style={{
                top: layout.outline.top,
                left: layout.outline.left,
                width: layout.outline.width,
                height: layout.outline.height,
                borderRadius: layout.outline.corners.map(corner => `${corner}px`).join(' ')
              }}
            />
          ) : null}
          <Dialog.Content
            ref={cardRef}
            // Only Skip tour, Done and Escape end it; a stray tap on the page doesn't
            onInteractOutside={event => event.preventDefault()}
            onOpenAutoFocus={event => {
              event.preventDefault();
              nextRef.current?.focus();
            }}
            className={cn(
              'fixed z-100 rounded-[26px] border border-border-strong bg-surface p-5 text-text shadow-[0_34px_80px_-24px_var(--shadow)] outline-none md:p-[22px]',
              isDesktop ? 'w-[380px]' : 'w-[calc(100vw-24px)]'
            )}
            // See-through rather than hidden while it's placed, so it can already have focus
            style={layout.card ?? { top: 0, left: 0, opacity: 0 }}>
            <TourCard
              step={step}
              index={index}
              total={total}
              onBack={() => goTo(index - 1)}
              onNext={next}
              onSkip={finish}
              nextRef={nextRef}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
