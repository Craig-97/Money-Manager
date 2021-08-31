import { ReactNode } from 'react';
import Box from '@material-ui/core/Box';

interface TabPanelProps {
  children?: ReactNode;
  value?: number;
  index?: number;
  dir?: string;
}

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};
