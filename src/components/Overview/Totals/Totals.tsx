import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentIcon from '@mui/icons-material/Payment';
import { Account } from '../../../types';
import { useAccountContext } from '../../../state/account-context';
import { BankBalanceCard } from './BankBalanceCard';
import { MonthlyBillsCard } from './MonthlyBillsCard';
import { MonthlyIncomeCard } from './MonthlyIncomeCard';
import { PaymentsDueCard } from './PaymentsDueCard';
import { TotalCard } from './TotalCard';

export const Totals = () => {
  const {
    state: { account }
  } = useAccountContext();
  const { bankFreeToSpend, discIncome, bankPaydayTotal, payDayDiscIncome }: Account = account;

  return (
    <div className="totals">
      <BankBalanceCard />
      <TotalCard
        classBaseName="free"
        title={'FREE TO SPEND'}
        amount={bankFreeToSpend}
        icon={<PaymentIcon color="action" />}
        disabled={true}
      />
      <PaymentsDueCard />
      <MonthlyBillsCard />
      <TotalCard
        classBaseName="payday-bank-total"
        title={'PAYDAY TOTAL'}
        amount={bankPaydayTotal}
        icon={<AccountBalanceIcon color="primary" />}
        disabled={true}
      />
      <TotalCard
        classBaseName="payday-discretionary"
        title={'PAYDAY DISC'}
        amount={payDayDiscIncome}
        icon={<PaymentIcon color="action" />}
        disabled={true}
      />
      <MonthlyIncomeCard />
      <TotalCard
        classBaseName="monthly-discretionary"
        title={'DISC INCOME'}
        amount={discIncome}
        icon={<LocalAtmIcon color="action" />}
        disabled={true}
      />
    </div>
  );
};
