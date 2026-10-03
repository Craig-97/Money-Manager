import { ReactNode } from 'react';
import { create } from 'zustand';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
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
