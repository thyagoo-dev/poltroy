import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      injectRegister: false,
      includeManifestIcons: false,
      manifest: {
        id: '/',
        name: 'POLTROY',
        short_name: 'POLTROY',
        description: 'Gestão operacional de viagens, passageiros e assentos de ônibus.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#F8FAFC',
        theme_color: '#F8FAFC',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,ico,woff,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
