import { useEffect } from 'react';

export function useGlobalShortcuts(
  newInvoice: () => void,
  openQuickCapture: () => void
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmd = navigator.platform.toLowerCase().includes('mac')
        ? e.metaKey
        : e.ctrlKey;
      const k = e.key.toLowerCase();
      if (isCmd && k === 'i') {
        e.preventDefault();
        newInvoice();
      }
      if (isCmd && k === 't') {
        e.preventDefault();
        openQuickCapture();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newInvoice, openQuickCapture]);
}
