import { ReactNode } from 'react';
import { create } from 'zustand';
import { getApiErrorMessage } from '~/lib/errors';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  icon?: ReactNode;
  // e.g. Undo after a delete
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()(set => ({
  toasts: [],
  show: toast => set(s => ({ toasts: [...s.toasts, { ...toast, id: nextId++ }] })),
  dismiss: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
}));

/* Shows a short message at the bottom of the screen, from anywhere */
export const showToast = (toast: Omit<Toast, 'id'>) => useToastStore.getState().show(toast);

/* What went wrong saving, from the API, or the fallback when it doesn't say */
export const showErrorToast = (
  error: unknown,
  { fallback = "Couldn't save that. Try again." } = {}
) => showToast({ message: getApiErrorMessage(error, fallback) });
