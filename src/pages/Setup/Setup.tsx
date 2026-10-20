import { useBankHolidays } from '~/hooks/useBankHolidays';
import { cn } from '~/lib/cn';
import { addDays, startOfToday } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { getNextPaydays } from '~/lib/payday';
import {
  AccountsStep,
  ComingUpStep,
  FirstCycleSummary,
  FreeToSpendStrip,
  PayStep,
  RegularsStep,
  ReviewStep,
  SetupAccountDialog,
  SetupDone,
  SetupFooter,
  SetupMobileHeader,
  SetupPaymentDialog,
  SetupSidebar
} from './components';
import { useSetup, useSetupDesktop } from './hooks';
import {
  accountsErrors,
  COMING_UP_STEP,
  PAY_FREQUENCY_LABELS,
  payErrors,
  paydayConfig,
  RULES,
  setupAccounts,
  STEPS,
  summariseFirstCycle
} from './setupModel';

/* First-time setup: pay, accounts and payments, saved as the budget at the end */
export const Setup = () => {
  const setup = useSetup();
  const isDesktop = useSetupDesktop();
  const { values, step, showErrors, finished } = setup;
  const holidays = useBankHolidays(values.region);
  const today = startOfToday();

  const firstCycle = summariseFirstCycle(values, { holidays, today });
  // Paydays after today, so on payday itself the first cycle runs to the next one
  const nextPaydays = getNextPaydays(paydayConfig(values), {
    holidays,
    from: addDays(today, 1),
    count: 2
  });
  const { heading, intro, mobileHeading, mobileIntro } = STEPS[step];
  const shownPayErrors = showErrors ? payErrors(values) : {};

  const stepSummaries = [
    `${PAY_FREQUENCY_LABELS[values.frequency]} · ${RULES[values.rule].title.toLowerCase()}`,
    values.accounts.length
      ? `${values.accounts.length + 1} accounts`
      : firstCycle.balance > 0
        ? formatMoney(firstCycle.balance)
        : 'Not set yet',
    `${values.regulars.length} ${values.regulars.length === 1 ? 'payment' : 'payments'}`,
    values.oneOffs.length
      ? `${values.oneOffs.length} ${values.oneOffs.length === 1 ? 'payment' : 'payments'}`
      : 'Optional',
    'Check and finish'
  ];

  return (
    <div className="flex h-dvh min-h-[640px] overflow-hidden">
      <SetupSidebar setup={setup} stepSummaries={stepSummaries} />

      {/* Mobile leaves room at the bottom for the fixed footer, taller with Skip on coming up */}
      <main
        className={cn(
          'h-full min-w-0 grow overflow-y-auto px-4 pt-3 min-[53.75rem]:px-12 min-[53.75rem]:pt-10 min-[53.75rem]:pb-14',
          finished ? 'pb-10' : step === COMING_UP_STEP ? 'pb-[178px]' : 'pb-[120px]'
        )}>
        <SetupMobileHeader setup={setup} />

        {finished ? (
          <SetupDone
            cycleEnd={firstCycle.cycleEnd}
            freeToSpend={firstCycle.freeToSpend}
            onReview={setup.reopen}
            onContinue={setup.goToDashboard}
          />
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] items-start justify-center gap-10 min-[73.75rem]:grid-cols-[minmax(0,660px)_340px]">
            <div
              aria-busy={setup.saving}
              className="flex min-w-0 flex-col gap-[22px] min-[53.75rem]:gap-7">
              <header className="flex flex-col gap-1.5">
                {/* Mobile's header already says which step this is */}
                {isDesktop ? (
                  <p className="text-[13px] font-bold text-accent-text">
                    Step {step + 1} of {STEPS.length} · {STEPS[step].title}
                  </p>
                ) : null}
                <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.04em] min-[53.75rem]:text-4xl">
                  {isDesktop ? heading : (mobileHeading ?? heading)}
                </h1>
                <p className="max-w-[560px] text-sm leading-normal text-muted min-[53.75rem]:text-[15px]">
                  {isDesktop ? intro : (mobileIntro ?? intro)}
                </p>
              </header>

              {!isDesktop && (step === 2 || step === COMING_UP_STEP) ? (
                <FreeToSpendStrip firstCycle={firstCycle} />
              ) : null}

              {step === 0 ? (
                <PayStep setup={setup} errors={shownPayErrors} nextPaydays={nextPaydays} />
              ) : null}
              {step === 1 ? (
                <AccountsStep setup={setup} errors={showErrors ? accountsErrors(values) : {}} />
              ) : null}
              {step === 2 ? (
                <RegularsStep
                  setup={setup}
                  monthlyTotal={firstCycle.monthly}
                  yearlyTotal={firstCycle.yearly}
                  today={today}
                />
              ) : null}
              {step === 3 ? <ComingUpStep setup={setup} today={today} /> : null}
              {step === 4 ? (
                <ReviewStep
                  setup={setup}
                  firstCycle={firstCycle}
                  nextPayday={nextPaydays[0]}
                  today={today}
                />
              ) : null}

              <SetupFooter setup={setup} />
            </div>

            <FirstCycleSummary
              firstCycle={firstCycle}
              paidIntoName={setupAccounts(values)[0].name}
            />
          </div>
        )}
      </main>
      <SetupPaymentDialog setup={setup} today={today} />
      <SetupAccountDialog setup={setup} />
    </div>
  );
};
