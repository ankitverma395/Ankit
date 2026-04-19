import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

import { registerSW } from 'virtual:pwa-register'

// ✅ SAFE SW (no crash in build)
if (import.meta.env.PROD) {
  registerSW({
    immediate: true
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
