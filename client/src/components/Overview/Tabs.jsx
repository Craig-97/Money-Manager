import React, { Fragment } from "react";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import HistoryIcon from "@material-ui/icons/History";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import ReceiptIcon from "@material-ui/icons/Receipt";

export const OverviewTabs = ({ value, setValue }) => {
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      "aria-controls": `full-width-tabpanel-${index}`
    };
  };

  return (
    <Fragment>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="History" icon={<HistoryIcon />} {...a11yProps(0)} />
        <Tab
          label="Upcoming payments"
          icon={<AccountBalanceWalletIcon />}
          {...a11yProps(1)}
        />
        <Tab label="Monthly bills" icon={<ReceiptIcon />} {...a11yProps(2)} />
      </Tabs>
    </Fragment>
  );
};
