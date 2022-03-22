import Tab from '@material-ui/core/Tab';
import { default as MaterialTabs } from '@material-ui/core/Tabs';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { ChangeEvent, Dispatch } from 'react';

interface OverviewTabsProps {
  value: number;
  setValue: Dispatch<number>;
}

export const Tabs = ({ value, setValue }: OverviewTabsProps) => {
  const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const a11yProps = (index: number) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`
    };
  };

  return (
    <MaterialTabs
      value={value}
      onChange={handleChange}
      indicatorColor="primary"
      textColor="primary"
      variant="fullWidth">
      <Tab label="Upcoming payments" icon={<AccountBalanceWalletIcon />} {...a11yProps(0)} />
      <Tab label="Monthly bills" icon={<ReceiptIcon />} {...a11yProps(1)} />
    </MaterialTabs>
  );
};
