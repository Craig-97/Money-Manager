import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, buttonVariants, PageLink } from '~/components/ui';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { useCarousel } from '../../../hooks';
import { cardClasses, eyebrowClasses, h2Classes, wrapClasses } from '../../landingClasses';

// Setup's steps, each about the same length so the cards line up
const STEPS = [
  {
    title: 'Pay',
    text: 'Weekly, fortnightly, four-weekly or monthly. Pick the last working day, a day of the week or a set date.'
  },
  {
    title: 'Your accounts',
    text: 'Start with where you get paid, then add any savings. Use the balances your banking app shows today.'
  },
  {
    title: 'Regular payments',
    text: 'Tap Rent, Council tax, Netflix and the rest, then set each amount and date. Income counts too.'
  },
  {
    title: 'Coming up',
    text: 'One-off payments due soon, like a birthday or a bill you already know about. Optional.'
  },
  {
    title: 'Review',
    text: 'Check it all looks right. You can change any of it later, then start your first cycle.'
  }
];

/*
 * Setup's five steps as a row of cards that scrolls sideways: ‹ and › or a mouse drag on desktop,
 * a swipe on a phone.
 */
export const HowItWorks = () => {
  const { trackRef, atStart, atEnd, previous, next, trackProps } = useCarousel<HTMLOListElement>();

  return (
    <section id="how" className={cn(wrapClasses, 'pb-14 md:pt-6 md:pb-24')}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col">
          <span className={eyebrowClasses}>How it works</span>
          <h2 className={cn(h2Classes, 'mt-3.5 md:mt-4')}>Five steps, then one tap each payday.</h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button
            size="xl"
            aria-label="Previous steps"
            onClick={previous}
            disabled={atStart}
            className="w-[54px] px-0">
            <ChevronLeft size={18} strokeWidth={2.25} aria-hidden="true" />
          </Button>
          <Button
            size="xl"
            aria-label="Next steps"
            onClick={next}
            disabled={atEnd}
            className="w-[54px] px-0">
            <ChevronRight size={18} strokeWidth={2.25} aria-hidden="true" />
          </Button>
          <PageLink
            page="register"
            to={ROUTES.register}
            className={buttonVariants({ size: 'xl', className: 'ml-2 px-[26px] font-bold' })}>
            Get started
          </PageLink>
        </div>
      </div>
      <ol
        ref={trackRef}
        aria-label="Setup steps, scroll sideways"
        // Keyboard users can scroll it with the arrow keys once it has focus
        tabIndex={0}
        onScroll={trackProps.onScroll}
        onPointerDown={trackProps.onPointerDown}
        onPointerMove={trackProps.onPointerMove}
        onPointerUp={trackProps.onPointerUp}
        onPointerCancel={trackProps.onPointerCancel}
        className="mt-6 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth pb-1 select-none focus-visible:rounded-[28px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:mt-9 md:cursor-grab md:gap-4 [&::-webkit-scrollbar]:hidden">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              cardClasses,
              'flex w-[280px] shrink-0 snap-start flex-col gap-3 p-5 md:w-[360px] md:gap-3.5 md:p-7'
            )}>
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-base font-extrabold text-on-accent md:size-11 md:text-[17px]">
              {index + 1}
            </span>
            <h3 className="text-[17px] font-extrabold tracking-[-0.02em] md:mt-2 md:text-[22px] md:tracking-[-0.03em]">
              {step.title}
            </h3>
            <p className="text-sm leading-[1.55] font-medium text-muted md:text-[15px]">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};
