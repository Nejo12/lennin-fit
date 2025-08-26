import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './app/AppRouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/global.scss'

const qc = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>
)
