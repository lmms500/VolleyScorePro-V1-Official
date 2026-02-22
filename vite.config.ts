
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Strip console/debugger statements in production builds
  esbuild: {
    drop: ['console', 'debugger'],
  },
  resolve: {
    // ========== PATH ALIASES (NOVO) ==========
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/@types'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@features': path.resolve(__dirname, './src/features'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@config': path.resolve(__dirname, './src/config'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
    // ========================================

    dedupe: ['react', 'react-dom'],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    // Ensure React is loaded first
    rollupOptions: {
      // Force React to be external to prevent duplication
      external: [],
      output: {
        // Force specific order of chunk loading
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          // React MUST be first chunk to avoid initialization errors
          'react-core': ['react', 'react-dom'],
          // Firebase (~100KB) - Auth, Firestore, Storage
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // Framer Motion (~45KB) - Animations
          'vendor-motion': ['framer-motion'],
          // Lucide React (tree-shakeable) - Icons
          'vendor-icons': ['lucide-react'],
          // DnD Kit (~30KB) - Drag and Drop (lazy loaded via CourtPage/CourtModal)
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Suppress chrome extension message channel errors
        navigationPreload: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'VolleyScore Pro',
        short_name: 'VolleyScore',
        description: 'Placar inteligente para vôlei. Indoor e Beach Volley com estatísticas, rotação inteligente e comandos de voz.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        scope: '/',
        start_url: '/?fullscreen=true',
        orientation: 'any',
        categories: ['sports', 'utilities', 'productivity'],
        id: 'volleyscore-pro',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
