import { useShallow } from 'zustand/react/shallow';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentIcon from '@mui/icons-material/Payment';
import Grid from '@mui/material/Grid2';
import { BankBalanceCard } from './BankBalanceCard';
import { MonthlyBillsCard } from './MonthlyBillsCard';
import { MonthlyIncomeCard } from './MonthlyIncomeCard';
import { PaymentsDueCard } from './PaymentsDueCard';
import { TotalCard } from './TotalCard';
import { useAccountStore } from '~/state';

export const Totals = () => {
  const [bankFreeToSpend, discIncome, bankPaydayBalance, payDayDiscIncome] = useAccountStore(
    useShallow(s => [
      s.account.bankFreeToSpend,
      s.account.discIncome,
      s.account.bankPaydayBalance,
      s.account.payDayDiscIncome
    ])
  );

  return (
    <Grid
      className="totals"
      container
      spacing={4}
      columns={{ mobile: 1, sm: 2, md: 4 }}
      sx={{ mb: 4 }}>
      <Grid size={1}>
        <BankBalanceCard />
      </Grid>
      <Grid size={1}>
        <TotalCard
          classBaseName="free-to-spend"
          title="FREE TO SPEND"
          amount={bankFreeToSpend}
          icon={<PaymentIcon color="action" />}
          disabled={true}
        />
      </Grid>
      <Grid size={1}>
        <PaymentsDueCard />
      </Grid>
      <Grid size={1}>
        <MonthlyBillsCard />
      </Grid>
      <Grid size={1}>
        <TotalCard
          classBaseName="payday-bank"
          title="PAYDAY BALANCE"
          amount={bankPaydayBalance}
          icon={<AccountBalanceIcon color="primary" />}
          disabled={true}
        />
      </Grid>
      <Grid size={1}>
        <TotalCard
          classBaseName="payday-discretionary"
          title="PAYDAY DISC"
          amount={payDayDiscIncome}
          icon={<PaymentIcon color="action" />}
          disabled={true}
        />
      </Grid>
      <Grid size={1}>
        <MonthlyIncomeCard />
      </Grid>
      <Grid size={1}>
        <TotalCard
          classBaseName="monthly-discretionary"
          title="DISC INCOME"
          amount={discIncome}
          icon={<LocalAtmIcon color="action" />}
          disabled={true}
        />
      </Grid>
    </Grid>
  );
};
