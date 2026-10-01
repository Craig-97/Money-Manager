export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarMessage {
  id: number;
  message: string;
  variant: SnackbarVariant;
}

export interface SnackbarContextType {
  enqueueSnackbar: (message: string, options?: { variant?: SnackbarVariant }) => void;
}
