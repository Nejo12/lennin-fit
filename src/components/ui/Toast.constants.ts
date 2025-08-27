export type ToastKind = 'default'|'success'|'error';
export type ToastItem = { id: string; title?: string; description?: string; duration?: number; kind?: ToastKind; };
export type ToastCtx = { add: (t: Omit<ToastItem, 'id'>) => string; remove: (id: string) => void; };
