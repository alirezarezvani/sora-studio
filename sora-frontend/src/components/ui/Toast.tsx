'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-900',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-500',
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} ${config.textColor} border-l-4 p-4 rounded-lg shadow-lg animate-slide-up min-w-[320px] max-w-md`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} flex-shrink-0 w-5 h-5 mt-0.5`} />
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};
