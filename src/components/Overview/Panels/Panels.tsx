import { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@material-ui/core/styles';
import { Tabs } from './Tabs';
import { MonthlyBills } from './MonthlyBills';
import { PaymentsDue } from './PaymentsDue';
import { TabPanel } from './TabPanel';

export const Panels = () => {
  const theme = useTheme();
  const [value, setValue] = useState<number>(0);

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <div className="panels">
      <AppBar position="static" color="default">
        <Tabs value={value} setValue={setValue} />
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
