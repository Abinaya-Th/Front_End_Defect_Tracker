import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // in ms
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isOpen,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded shadow-lg text-white flex items-center gap-3 transition-all
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}; 