import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />,
    error: <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />,
    info: <Info className="w-5 h-5 text-blue-500" aria-hidden="true" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" aria-hidden="true" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 z-50 ${
        bgColors[type]
      } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="Close notification"
        className="ml-2"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
