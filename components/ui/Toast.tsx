import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../../types';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const typeClasses = {
    success: 'bg-green-600 border-green-700',
    error: 'bg-red-600 border-red-700',
    info: 'bg-blue-600 border-blue-700',
  };

  return (
    <div
      className={`relative w-full max-w-sm p-4 text-white rounded-lg shadow-lg border-l-4 transition-all duration-300 transform ${typeClasses[toast.type]} ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      <div className="flex items-center">
        <p className="flex-grow font-medium">{toast.message}</p>
        <button
          onClick={handleDismiss}
          className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
