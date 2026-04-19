import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

import { registerSW } from 'virtual:pwa-register'

// ✅ SAFE PWA (NO CRASH)
if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('App ready for offline use')
    },
    onNeedRefresh() {
      console.log('New version available')
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
