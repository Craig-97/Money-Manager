import { ReactNode } from 'react';

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
      className="tab-panel"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}>
      {value === index && <div>{children}</div>}
    </div>
  );
};
