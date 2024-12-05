import { useShallow } from 'zustand/react/shallow';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
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
    <Grid container spacing={4} columns={{ mobile: 1, sm: 2, md: 4 }} sx={{ mb: 4 }}>
      <Grid size={1}>
        <BankBalanceCard />
      </Grid>
      <Grid size={1}>
        <TotalCard
          title="FREE TO SPEND"
          amount={bankFreeToSpend}
          icon={<AccountBalanceWalletOutlinedIcon />}
          iconColor="success"
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
          title="PAYDAY BALANCE"
          amount={bankPaydayBalance}
          icon={<CalendarTodayOutlinedIcon />}
          iconColor="primary"
          disabled={true}
        />
      </Grid>
      <Grid size={1}>
        <TotalCard
          title="PAYDAY DISC"
          amount={payDayDiscIncome}
          icon={<SavingsOutlinedIcon />}
          iconColor="success"
          disabled={true}
        />
      </Grid>
      <Grid size={1}>
        <MonthlyIncomeCard />
      </Grid>
      <Grid size={1}>
        <TotalCard
          title="DISC INCOME"
          amount={discIncome}
          icon={<PaidOutlinedIcon />}
          iconColor="success"
          disabled={true}
        />
      </Grid>
    </Grid>
  );
};
