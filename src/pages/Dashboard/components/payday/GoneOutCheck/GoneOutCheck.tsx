import { PaydayPrompt } from '../../../hooks/usePaydayPrompt';
import { DueSinceRow } from '../DueSinceRow';
import { LeftOverRow } from '../LeftOverRow';
import { Step } from '../Step';

const groupHeadClasses =
  'mt-4 mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-0.5 text-xs font-extrabold tracking-[0.04em] text-muted uppercase';
const groupNoteClasses = 'text-xs font-semibold tracking-normal normal-case';
const groupClasses = 'overflow-hidden rounded-[20px] border border-border bg-surface-2';

/*
 * Step 1, "Check what's gone out", so nothing comes off the balance twice. Each group only shows
 * when it has something in it.
 */
export const GoneOutCheck = ({ prompt }: { prompt: PaydayPrompt }) => (
  <Step number={1} title="Check what’s gone out">
    <p className="mt-1.5 text-xs leading-normal font-medium text-muted md:text-[13px]">
      So nothing comes off your balance twice. What you choose here changes the balance suggested
      next.
    </p>

    {prompt.leftOver.length ? (
      <>
        <div className={groupHeadClasses}>
          From last cycle
          <span className={groupNoteClasses}>Never marked paid or skipped</span>
        </div>
        <div className={groupClasses}>
          {prompt.leftOver.map(item => (
            <LeftOverRow key={item.payment.id} item={item} />
          ))}
        </div>
      </>
    ) : null}

    {prompt.dueSince.length ? (
      <>
        <div className={groupHeadClasses}>
          {prompt.daysLate ? 'Due since payday' : 'Due today'}
          <span className={groupNoteClasses}>Tick any that have already left</span>
        </div>
        <div className={groupClasses}>
          {prompt.dueSince.map(item => (
            <DueSinceRow key={item.key} item={item} />
          ))}
        </div>
        <p className="mt-2 text-xs leading-normal font-medium text-muted md:mt-2.5 md:text-[13px]">
          Ticked ones are recorded as paid. Ones left unticked stay due.
        </p>
      </>
    ) : null}
  </Step>
);
