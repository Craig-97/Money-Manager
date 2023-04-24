import AppBar from '@mui/material/AppBar';
import Tab from '@mui/material/Tab';
import { useRef, useState } from 'react';
import { TabPanel, Tabs } from '../Tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import Slider from 'react-slick';

export const LoginPanels = () => {
  const [value, setValue] = useState<number>(0);
  const sliderRef = useRef<Slider | null>(null);

  const onTabChange = (index: number) => {
    if (index !== value) {
      setValue(index);
      sliderRef?.current?.slickGoTo(index, true);
    }
  };

  return (
    <div className="login-panels">
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={onTabChange}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </AppBar>
      <Slider
        ref={sliderRef}
        speed={350}
        dots={false}
        arrows={false}
        infinite={false}
        draggable={false}
        adaptiveHeight
        beforeChange={(_, newIndex) => newIndex !== value && setValue(newIndex)}>
        <TabPanel value={value} index={0}>
          <LoginForm />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <RegisterForm />
        </TabPanel>
      </Slider>
    </div>
  );
};
