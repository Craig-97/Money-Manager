import { green } from '@material-ui/core/colors';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import PaymentIcon from '@material-ui/icons/Payment';
import { Account } from '../../interfaces';
import { useAccountContext } from '../../state/account-context';
import { BankBalanceCard } from './BankBalanceCard';
import { MonthlyBillsCard } from './MonthlyBillsCard';
import { MonthlyIncomeCard } from './MonthlyIncomeCard';
import { TotalCard } from './TotalCard';

export const Totals = () => {
  const {
    state: { account }
  } = useAccountContext();
  const {
    bankFreeToSpend,
    paymentsDueTotal,
    discIncome,
    bankPaydayTotal,
    payDayDiscIncome
  }: Account = account;

  return (
    <div className="totals">
      <BankBalanceCard />
      <TotalCard
        classBaseName="free"
        title={'FREE TO SPEND'}
        amount={bankFreeToSpend}
        icon={<PaymentIcon style={{ color: green[500], fontSize: 50 }} />}
        disabled={true}
      />
      <TotalCard
        classBaseName="payments-due"
        title={'PAYMENTS DUE'}
        amount={paymentsDueTotal}
        icon={
          <AccountBalanceWalletIcon
            color="secondary"
            style={{ fontSize: 50 }}
          />
        }
      />
      <MonthlyBillsCard />
      <TotalCard
        classBaseName="payday-bank-total"
        title={'PAYDAY TOTAL'}
        amount={bankPaydayTotal}
        icon={<AccountBalanceIcon color="primary" style={{ fontSize: 50 }} />}
        disabled={true}
      />
      <TotalCard
        classBaseName="payday-discretionary"
        title={'PAYDAY DISC'}
        amount={payDayDiscIncome}
        icon={<PaymentIcon style={{ color: green[500], fontSize: 50 }} />}
        disabled={true}
      />
      <MonthlyIncomeCard />
      <TotalCard
        classBaseName="monthly-discretionary"
        title={'DISC INCOME'}
        amount={discIncome}
        icon={<LocalAtmIcon style={{ color: green[500], fontSize: 50 }} />}
        disabled={true}
      />
    </div>
  );
};
