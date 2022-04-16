import { default as MaterialTabs } from '@mui/material/Tabs';
import { ChangeEvent, Dispatch, ReactNode } from 'react';

interface TabsProps {
  value: number;
  setValue: Dispatch<number>;
  children?: ReactNode;
}

export const Tabs = ({ value, setValue, children }: TabsProps) => {
  const handleChange = (event: ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <MaterialTabs
      value={value}
      onChange={handleChange}
      indicatorColor="primary"
      textColor="primary"
      variant="fullWidth">
      {children && children}
    </MaterialTabs>
  );
};
