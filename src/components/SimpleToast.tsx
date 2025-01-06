import React, { useState, useEffect } from 'react';

interface SimpleToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const SimpleToast: React.FC<SimpleToastProps> = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' :
                  type === 'error' ? 'bg-red-500' :
                  'bg-yellow-500';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg`}>
      {message}
    </div>
  );
};

interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const useSimpleToast = () => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToast(options);
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
};

