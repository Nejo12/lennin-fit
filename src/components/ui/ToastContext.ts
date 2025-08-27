import { createContext } from 'react';
import type { ToastCtx } from './Toast.constants';

export const Ctx = createContext<ToastCtx | null>(null);
