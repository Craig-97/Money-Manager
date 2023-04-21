import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AppBar from '@mui/material/AppBar';
import Tab from '@mui/material/Tab';
import { useRef, useState } from 'react';
import { TabPanel, Tabs } from '~/components/Tabs';
import { MonthlyBills } from './MonthlyBills';
import { PaymentsDue } from './PaymentsDue';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

export const Panels = () => {
  const [value, setValue] = useState<number>(0);
  const swiperRef = useRef<SwiperRef>(null);

  const onTabChange = (index: number) => {
    if (index !== value) {
      setValue(index);
    }

    swiperRef?.current?.swiper?.slideTo(index);
  };

  return (
    <div className="overview-panels">
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={onTabChange}>
          <Tab label="Upcoming payments" icon={<AccountBalanceWalletIcon />} />
          <Tab label="Monthly bills" icon={<ReceiptIcon />} />
        </Tabs>
      </AppBar>
      <Swiper
        ref={swiperRef}
        slidesPerView="auto"
        cssMode={true}
        height={450}
        onSlideChange={swiper => swiper?.activeIndex !== value && setValue(swiper?.activeIndex)}>
        <SwiperSlide>
          <TabPanel value={value} index={0}>
            <PaymentsDue />
          </TabPanel>
        </SwiperSlide>
        <SwiperSlide>
          <TabPanel value={value} index={1}>
            <MonthlyBills />
          </TabPanel>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};
