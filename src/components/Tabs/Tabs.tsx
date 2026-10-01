import { ChangeEvent, ReactNode } from 'react';
import { default as MaterialTabs } from '@mui/material/Tabs';

interface TabsProps {
  value: number;
  onChange: (index: number) => void;
  children?: ReactNode;
}

export const Tabs = ({ value, onChange, children }: TabsProps) => {
  const handleChange = (event: ChangeEvent<object>, newValue: number) => {
    onChange(newValue);
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
