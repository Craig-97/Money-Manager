import React, { createContext, useContext, useState } from 'react';
import { Portal } from '@mui/material';
import { useSidebarStore } from '../../sidebar';
import { SnackbarAlert } from '~/components';
import { useSnackbarContainer } from '~/hooks';
import { SnackbarContextType, SnackbarMessage, SnackbarVariant } from '~/types';

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const { container, isLoading } = useSnackbarContainer();
  const isOpen = useSidebarStore(state => state.isOpen);

  const enqueueSnackbar = (text: string, options?: { variant?: SnackbarVariant }) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        message: text,
        variant: options?.variant || 'info'
      }
    ]);
  };

  const handleClose = (id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ enqueueSnackbar }}>
      {children}
      {!isLoading && container && (
        <Portal container={container}>
          {messages.map((msg, index) => (
            <SnackbarAlert
              key={msg.id}
              message={msg}
              index={index}
              isOpen={isOpen}
              onClose={handleClose}
            />
          ))}
        </Portal>
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
