import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { TextInput, TextInputProps } from '../TextInput';

/* A password field with a button to show what's been typed */
export const PasswordInput = (props: Omit<TextInputProps, 'type' | 'suffix'>) => {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      type={visible ? 'text' : 'password'}
      suffix={
        <IconButton
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible(v => !v)}>
          {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </IconButton>
      }
    />
  );
};
