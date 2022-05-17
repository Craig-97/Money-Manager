import AppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import { useState } from 'react';
import { TabPanel, Tabs } from '../Tabs';
import { LoginForm } from './LoginForm';
import { Register } from './Register';

export const LoginPanels = () => {
  const theme = useTheme();
  const [value, setValue] = useState<number>(0);

  // const handleChangeIndex = (index: number) => {
  //   //Swipeable views bug fix
  //   if (index > 1) {
  //     setValue(1);
  //   } else {
  //     setValue(index);
  //   }
  // };

  return (
    <div className="login-panels">
      <AppBar position="static" color="default">
        <Tabs value={value} setValue={setValue}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
      </AppBar>
      {/* <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}> */}
      <TabPanel value={value} index={0} dir={theme.direction}>
        <LoginForm />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <Register />
      </TabPanel>
      {/* </SwipeableViews> */}
    </div>
  );
};
