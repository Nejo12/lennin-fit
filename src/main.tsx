import posthog from 'posthog-js'
posthog.init(import.meta.env.VITE_POSTHOG_KEY ?? '', { api_host: 'https://app.posthog.com', capture_pageview: true })

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
