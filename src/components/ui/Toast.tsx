import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './Toast.module.scss';
import Button from './Button';
import type { ToastItem } from './Toast.constants';
import { Ctx } from './ToastContext';

export function ToastProvider({ children }: React.PropsWithChildren) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback((t: Omit<ToastItem,'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, duration: 3500, kind: 'default', ...t };
    setItems(prev => [...prev, item]);
    timers.current[id] = setTimeout(() => remove(id), item.duration);
    return id;
  }, [remove]);

  const value = useMemo(() => ({ add, remove }), [add, remove]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {createPortal(
        <div className={s.viewport} role="region" aria-label="Notifications">
          {items.map(i => (
            <div key={i.id} className={s.toast} role="status" aria-live="polite">
              {i.title && <div className={s.title}>{i.title}</div>}
              {i.description && <div className={s.desc}>{i.description}</div>}
              <div className={s.row}>
                <Button variant="ghost" size="sm" onClick={() => remove(i.id)}>Close</Button>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </Ctx.Provider>
  );
}


