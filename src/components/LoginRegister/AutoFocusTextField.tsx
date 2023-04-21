import TextField, { TextFieldProps } from '@mui/material/TextField';
import { useEffect, useRef } from 'react';

/* Created to avoid autoFocus animation issues with Swiper and Material UI Tabs */
export const AutoFocusTextField = (props: TextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef?.current?.focus();
    }, 200); // 200+ avoids any animation issues

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return <TextField inputRef={inputRef} {...props} />;
};
