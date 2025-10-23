'use client';

import React from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { useToastStore } from '@/hooks/useToast';

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
};
