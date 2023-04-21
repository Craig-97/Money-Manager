import AppBar from '@mui/material/AppBar';
import Tab from '@mui/material/Tab';
import { useRef, useState } from 'react';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { TabPanel, Tabs } from '../Tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const LoginPanels = () => {
  const [value, setValue] = useState<number>(0);
  const swiperRef = useRef<SwiperRef>(null);

  const onTabChange = (index: number) => {
    if (index !== value) {
      setValue(index);
    }

    swiperRef?.current?.swiper?.slideTo(index);
  };

  return (
    <div className="login-panels">
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={onTabChange}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </AppBar>
      <Swiper
        cssMode={true}
        ref={swiperRef}
        slidesPerView="auto"
        onSlideChange={swiper => swiper?.activeIndex !== value && setValue(swiper?.activeIndex)}>
        <SwiperSlide>
          <TabPanel value={value} index={0}>
            <LoginForm />
          </TabPanel>
        </SwiperSlide>
        <SwiperSlide>
          <TabPanel value={value} index={1}>
            <RegisterForm />
          </TabPanel>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};
