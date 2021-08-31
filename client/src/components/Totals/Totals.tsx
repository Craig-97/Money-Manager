import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import PaymentIcon from '@material-ui/icons/Payment';
import ReceiptIcon from '@material-ui/icons/Receipt';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { TotalCard } from './TotalCard';
import { green } from '@material-ui/core/colors';
import { useAccountContext } from '../../state/account-context';
import { BankBalanceCard } from './BankBalanceCard';
import { MonthlyIncomeCard } from './MonthlyIncomeCard';
import { Account } from '../../interfaces';

export const Totals = () => {
  const {
    state: { account }
  } = useAccountContext();
  const {
    bankFreeToSpend,
    billsTotal,
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
      <TotalCard
        classBaseName="bills"
        title={'MONTHLY BILLS'}
        amount={billsTotal}
        icon={<ReceiptIcon color="secondary" style={{ fontSize: 50 }} />}
      />
      <TotalCard
        classBaseName="payday-bank-total"
        title={'PAYDAY TOTAL'}
        amount={bankPaydayTotal}
        icon={<AccountBalanceIcon color="primary" style={{ fontSize: 50 }} />}
      />
      <TotalCard
        classBaseName="payday-discretionary"
        title={'PAYDAY DISC'}
        amount={payDayDiscIncome}
        icon={<PaymentIcon style={{ color: green[500], fontSize: 50 }} />}
      />
      <MonthlyIncomeCard />
      <TotalCard
        classBaseName="monthly-discretionary"
        title={'DISC INCOME'}
        amount={discIncome}
        icon={<LocalAtmIcon style={{ color: green[500], fontSize: 50 }} />}
      />
    </div>
  );
};
