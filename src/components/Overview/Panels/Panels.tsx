import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { TabPanel, Tabs } from '../../Tabs';
import { MonthlyBills } from './MonthlyBills';
import { PaymentsDue } from './PaymentsDue';

export const Panels = () => {
  const theme = useTheme();
  const [value, setValue] = useState<number>(0);

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <div className="overview-panels">
      <AppBar position="static" color="default">
        <Tabs value={value} setValue={setValue}>
          <Tab label="Upcoming payments" icon={<AccountBalanceWalletIcon />} />
          <Tab label="Monthly bills" icon={<ReceiptIcon />} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <PaymentsDue />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <MonthlyBills />
        </TabPanel>
      </SwipeableViews>
    </div>
  );
};
