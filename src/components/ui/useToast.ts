import { useContext } from 'react';
import { Ctx } from './ToastContext';

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
