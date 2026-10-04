import { useBankHolidays } from '~/hooks/useBankHolidays';
import { addDays, startOfToday } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { getNextPaydays } from '~/lib/payday';
import {
  BalanceStep,
  ComingUpStep,
  FirstCycleSummary,
  PayStep,
  RegularsStep,
  ReviewStep,
  SetupDone,
  SetupFooter,
  SetupMobileHeader,
  SetupSidebar
} from './components';
import { useSetup } from './hooks';
import {
  balanceError,
  PAY_FREQUENCY_LABELS,
  payErrors,
  paydayConfig,
  RULES,
  STEPS,
  summariseFirstCycle
} from './setupModel';

/* First-time setup: pay, balance and payments, saved as the account at the end */
export const Setup = () => {
  const setup = useSetup();
  const { values, step, showErrors, finished } = setup;
  const holidays = useBankHolidays(values.region);
  const today = startOfToday();

  const firstCycle = summariseFirstCycle(values, holidays, today);
  // Paydays after today, so on payday itself the first cycle runs to the next one
  const nextPaydays = getNextPaydays(paydayConfig(values), holidays, addDays(today, 1), 2);
  const shownPayErrors = showErrors ? payErrors(values) : {};

  const stepSummaries = [
    `${PAY_FREQUENCY_LABELS[values.frequency]} · ${RULES[values.rule].title.toLowerCase()}`,
    firstCycle.balance > 0 ? formatMoney(firstCycle.balance) : 'Not set yet',
    `${values.regulars.length} ${values.regulars.length === 1 ? 'payment' : 'payments'}`,
    values.oneOffs.length
      ? `${values.oneOffs.length} ${values.oneOffs.length === 1 ? 'payment' : 'payments'}`
      : 'Optional',
    'Check and finish'
  ];

  return (
    <div className="flex h-dvh min-h-[640px] overflow-hidden">
      <SetupSidebar setup={setup} stepSummaries={stepSummaries} />

      <main className="h-full min-w-0 grow overflow-y-auto px-4 pt-5 pb-10 min-[53.75rem]:px-12 min-[53.75rem]:pt-10 min-[53.75rem]:pb-14">
        <SetupMobileHeader setup={setup} />

        {finished ? (
          <SetupDone
            cycleEnd={firstCycle.cycleEnd}
            freeToSpend={firstCycle.freeToSpend}
            onReview={setup.reopen}
            onContinue={() => void setup.goToDashboard()}
          />
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] items-start justify-center gap-10 min-[73.75rem]:grid-cols-[minmax(0,660px)_340px]">
            <div aria-busy={setup.saving} className="flex min-w-0 flex-col gap-7">
              <header className="flex flex-col gap-1.5">
                <p className="text-[13px] font-bold text-accent-text">
                  Step {step + 1} of {STEPS.length} · {STEPS[step].title}
                </p>
                <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.04em] min-[53.75rem]:text-4xl">
                  {STEPS[step].heading}
                </h1>
                <p className="max-w-[560px] text-[15px] leading-normal text-muted">
                  {STEPS[step].intro}
                </p>
              </header>

              {step === 0 ? (
                <PayStep setup={setup} errors={shownPayErrors} nextPaydays={nextPaydays} />
              ) : null}
              {step === 1 ? (
                <BalanceStep setup={setup} error={showErrors ? balanceError(values) : undefined} />
              ) : null}
              {step === 2 ? <RegularsStep setup={setup} monthlyTotal={firstCycle.monthly} /> : null}
              {step === 3 ? <ComingUpStep setup={setup} /> : null}
              {step === 4 ? (
                <ReviewStep setup={setup} firstCycle={firstCycle} nextPayday={nextPaydays[0]} />
              ) : null}

              <SetupFooter setup={setup} />
            </div>

            <FirstCycleSummary {...firstCycle} />
          </div>
        )}
      </main>
    </div>
  );
};
