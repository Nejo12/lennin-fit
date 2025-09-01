import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AppRouter from './app/AppRouter';
import { initPerformanceOptimizations } from '@/lib/performance';
import '@/styles/globals.scss';
import '@/styles/print.scss';
import '@/styles/schedule.scss';

// Initialize performance optimizations
initPerformanceOptimizations();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
