import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      strategies: 'generateSW',

      devOptions: {
        enabled: false
      },

      includeAssets: ['favicon.ico'],

      manifest: {
        name: 'Music Studio',
        short_name: 'VermaJi Music',
        description: 'Stream & enjoy music',

        start_url: '/',
        scope: '/',
        display: 'standalone',

        background_color: '#000000',
        theme_color: '#000000',

        orientation: 'portrait-primary',

        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ]
})
