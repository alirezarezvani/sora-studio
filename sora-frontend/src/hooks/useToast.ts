'use client';

import { create } from 'zustand';
import { ToastProps, ToastVariant } from '@/components/ui/Toast';

interface ToastState {
  toasts: ToastProps[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, variant = 'info', duration = 5000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newToast: ToastProps = {
      id,
      message,
      variant,
      duration,
      onClose: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

export const useToast = () => {
  const { addToast, removeToast, clearAll } = useToastStore();

  return {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    remove: removeToast,
    clearAll,
  };
};
