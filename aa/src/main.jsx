import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { ThemeProvider } from './context/ThemeContext'

import { registerSW } from 'virtual:pwa-register'

// 🔥 FINAL SW SETUP (MOBILE FIX)
registerSW({
  immediate: true,

  onRegistered(registration) {
    console.log('✅ SW Registered')

    if (registration) {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('🔥 SW Activated → Reload')
            window.location.reload()
          }
        })
      })
    }
  },

  onOfflineReady() {
    console.log('📱 Offline ready')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
