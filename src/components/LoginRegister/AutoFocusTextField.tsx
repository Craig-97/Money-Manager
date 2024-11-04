import { useEffect, useRef } from 'react';
import { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';

/* Created to avoid autoFocus animation issues with react-slick and Material UI Tabs */
export const AutoFocusTextField = (props: TextFieldProps) => {
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef?.current?.focus();
    }, 250); // 250+ avoids any animation issues

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return <TextField inputRef={inputRef} {...props} />;
};
