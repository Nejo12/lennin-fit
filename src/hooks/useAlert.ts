import { useState, useCallback } from 'react';

interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'danger';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showAlert = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        type?: 'info' | 'success' | 'warning' | 'error';
      }
    ) => {
      setAlertState({
        isOpen: true,
        message,
        type: options?.type || 'info',
        title: options?.title,
      });
    },
    []
  );

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: {
        title?: string;
        type?: 'info' | 'warning' | 'danger';
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      setAlertState({
        isOpen: true,
        message,
        type: options?.type || 'info',
        title: options?.title,
        onConfirm,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    alertState.onConfirm?.();
    closeAlert();
  }, [closeAlert, alertState]);

  return {
    alertState,
    showAlert,
    showConfirm,
    closeAlert,
    handleConfirm,
  };
}
