import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AppBar from '@mui/material/AppBar';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import { useRef, useState } from 'react';
import Slider from 'react-slick';
import { TabPanel, Tabs } from '~/components/Tabs';
import { MonthlyBills } from './MonthlyBills';
import { PaymentsDue } from './PaymentsDue';

export const Panels = () => {
  const [value, setValue] = useState<number>(0);
  const sliderRef = useRef<Slider | null>(null);

  const onTabChange = (index: number) => {
    if (index !== value) {
      setValue(index);
      sliderRef?.current?.slickGoTo(index, true);
    }
  };

  return (
    <Card className="overview-panels">
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={onTabChange}>
          <Tab label="Upcoming payments" icon={<AccountBalanceWalletIcon />} />
          <Tab label="Monthly bills" icon={<ReceiptIcon />} />
        </Tabs>
      </AppBar>
      <Slider
        ref={sliderRef}
        dots={false}
        arrows={false}
        infinite={false}
        draggable={false}
        adaptiveHeight
        beforeChange={(_, newIndex) => newIndex !== value && setValue(newIndex)}>
        <TabPanel value={value} index={0}>
          <PaymentsDue />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <MonthlyBills />
        </TabPanel>
      </Slider>
    </Card>
  );
};
