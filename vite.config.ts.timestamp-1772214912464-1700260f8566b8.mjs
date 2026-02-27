// vite.config.ts
import { defineConfig } from "file:///C:/Dev/VolleyScore-Pro/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Dev/VolleyScore-Pro/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///C:/Dev/VolleyScore-Pro/node_modules/vite-plugin-pwa/dist/index.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Dev/VolleyScore-Pro/vite.config.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  // Strip console/debugger statements in production builds
  esbuild: {
    drop: ["console", "debugger"]
  },
  resolve: {
    // ========== PATH ALIASES (NOVO) ==========
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@types": path.resolve(__dirname, "./src/@types"),
      "@ui": path.resolve(__dirname, "./src/ui"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@layouts": path.resolve(__dirname, "./src/layouts"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages")
    },
    // ========================================
    dedupe: ["react", "react-dom"]
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    // Ensure React is loaded first
    rollupOptions: {
      // Force React to be external to prevent duplication
      external: [],
      output: {
        // Force specific order of chunk loading
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks: {
          // React MUST be first chunk to avoid initialization errors
          "react-core": ["react", "react-dom"],
          // Firebase (~100KB) - Auth, Firestore, Storage
          "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
          // Framer Motion (~45KB) - Animations
          "vendor-motion": ["framer-motion"],
          // Lucide React (tree-shakeable) - Icons
          "vendor-icons": ["lucide-react"],
          // DnD Kit (~30KB) - Drag and Drop (lazy loaded via CourtPage/CourtModal)
          "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"]
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "logo.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Suppress chrome extension message channel errors
        navigationPreload: false,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: "VolleyScore Pro",
        short_name: "VolleyScore",
        description: "Placar inteligente para v\xF4lei. Indoor e Beach Volley com estat\xEDsticas, rota\xE7\xE3o inteligente e comandos de voz.",
        theme_color: "#020617",
        background_color: "#020617",
        display: "fullscreen",
        display_override: ["fullscreen", "standalone"],
        scope: "/",
        start_url: "/?fullscreen=true",
        orientation: "any",
        categories: ["sports", "utilities", "productivity"],
        id: "volleyscore-pro",
        icons: [
          {
            src: "icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxEZXZcXFxcVm9sbGV5U2NvcmUtUHJvXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxEZXZcXFxcVm9sbGV5U2NvcmUtUHJvXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9EZXYvVm9sbGV5U2NvcmUtUHJvL3ZpdGUuY29uZmlnLnRzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcclxuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcclxuXHJcbi8vIFJlY29uc3RydWN0IF9fZGlybmFtZSBmb3IgRVNNXHJcbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgLy8gU3RyaXAgY29uc29sZS9kZWJ1Z2dlciBzdGF0ZW1lbnRzIGluIHByb2R1Y3Rpb24gYnVpbGRzXHJcbiAgZXNidWlsZDoge1xyXG4gICAgZHJvcDogWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10sXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICAvLyA9PT09PT09PT09IFBBVEggQUxJQVNFUyAoTk9WTykgPT09PT09PT09PVxyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgICAgJ0B0eXBlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9AdHlwZXMnKSxcclxuICAgICAgJ0B1aSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91aScpLFxyXG4gICAgICAnQGxpYic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9saWInKSxcclxuICAgICAgJ0BmZWF0dXJlcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9mZWF0dXJlcycpLFxyXG4gICAgICAnQGNvbnRleHRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2NvbnRleHRzJyksXHJcbiAgICAgICdAbGF5b3V0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9sYXlvdXRzJyksXHJcbiAgICAgICdAY29uZmlnJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2NvbmZpZycpLFxyXG4gICAgICAnQGhvb2tzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2hvb2tzJyksXG4gICAgICAnQHBhZ2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3BhZ2VzJyksXHJcbiAgICB9LFxyXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGRlZHVwZTogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXHJcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgLy8gRW5zdXJlIFJlYWN0IGlzIGxvYWRlZCBmaXJzdFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAvLyBGb3JjZSBSZWFjdCB0byBiZSBleHRlcm5hbCB0byBwcmV2ZW50IGR1cGxpY2F0aW9uXHJcbiAgICAgIGV4dGVybmFsOiBbXSxcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgLy8gRm9yY2Ugc3BlY2lmaWMgb3JkZXIgb2YgY2h1bmsgbG9hZGluZ1xyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV0nLFxyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gUmVhY3QgTVVTVCBiZSBmaXJzdCBjaHVuayB0byBhdm9pZCBpbml0aWFsaXphdGlvbiBlcnJvcnNcclxuICAgICAgICAgICdyZWFjdC1jb3JlJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICAgICAgICAgIC8vIEZpcmViYXNlICh+MTAwS0IpIC0gQXV0aCwgRmlyZXN0b3JlLCBTdG9yYWdlXHJcbiAgICAgICAgICAndmVuZG9yLWZpcmViYXNlJzogWydmaXJlYmFzZS9hcHAnLCAnZmlyZWJhc2UvYXV0aCcsICdmaXJlYmFzZS9maXJlc3RvcmUnLCAnZmlyZWJhc2Uvc3RvcmFnZSddLFxyXG4gICAgICAgICAgLy8gRnJhbWVyIE1vdGlvbiAofjQ1S0IpIC0gQW5pbWF0aW9uc1xyXG4gICAgICAgICAgJ3ZlbmRvci1tb3Rpb24nOiBbJ2ZyYW1lci1tb3Rpb24nXSxcclxuICAgICAgICAgIC8vIEx1Y2lkZSBSZWFjdCAodHJlZS1zaGFrZWFibGUpIC0gSWNvbnNcclxuICAgICAgICAgICd2ZW5kb3ItaWNvbnMnOiBbJ2x1Y2lkZS1yZWFjdCddLFxyXG4gICAgICAgICAgLy8gRG5EIEtpdCAofjMwS0IpIC0gRHJhZyBhbmQgRHJvcCAobGF6eSBsb2FkZWQgdmlhIENvdXJ0UGFnZS9Db3VydE1vZGFsKVxyXG4gICAgICAgICAgJ3ZlbmRvci1kbmQnOiBbJ0BkbmQta2l0L2NvcmUnLCAnQGRuZC1raXQvc29ydGFibGUnLCAnQGRuZC1raXQvdXRpbGl0aWVzJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmplY3RSZWdpc3RlcjogJ2F1dG8nLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ2xvZ28uc3ZnJ10sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsc3ZnLHBuZyxpY28sanNvbix3b2ZmMn0nXSxcclxuICAgICAgICBjbGVhbnVwT3V0ZGF0ZWRDYWNoZXM6IHRydWUsXHJcbiAgICAgICAgY2xpZW50c0NsYWltOiB0cnVlLFxyXG4gICAgICAgIHNraXBXYWl0aW5nOiB0cnVlLFxyXG4gICAgICAgIC8vIFN1cHByZXNzIGNocm9tZSBleHRlbnNpb24gbWVzc2FnZSBjaGFubmVsIGVycm9yc1xyXG4gICAgICAgIG5hdmlnYXRpb25QcmVsb2FkOiBmYWxzZSxcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnc3RhdGljLWZvbnRzLWNhY2hlJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7IG1heEVudHJpZXM6IDEwLCBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZTogeyBzdGF0dXNlczogWzAsIDIwMF0gfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdWb2xsZXlTY29yZSBQcm8nLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdWb2xsZXlTY29yZScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdQbGFjYXIgaW50ZWxpZ2VudGUgcGFyYSB2XHUwMEY0bGVpLiBJbmRvb3IgZSBCZWFjaCBWb2xsZXkgY29tIGVzdGF0XHUwMEVEc3RpY2FzLCByb3RhXHUwMEU3XHUwMEUzbyBpbnRlbGlnZW50ZSBlIGNvbWFuZG9zIGRlIHZvei4nLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzAyMDYxNycsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwMjA2MTcnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdmdWxsc2NyZWVuJyxcclxuICAgICAgICBkaXNwbGF5X292ZXJyaWRlOiBbJ2Z1bGxzY3JlZW4nLCAnc3RhbmRhbG9uZSddLFxyXG4gICAgICAgIHNjb3BlOiAnLycsXHJcbiAgICAgICAgc3RhcnRfdXJsOiAnLz9mdWxsc2NyZWVuPXRydWUnLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnYW55JyxcclxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3Nwb3J0cycsICd1dGlsaXRpZXMnLCAncHJvZHVjdGl2aXR5J10sXHJcbiAgICAgICAgaWQ6ICd2b2xsZXlzY29yZS1wcm8nLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJ2ljb24ucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdpY29uLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICBdLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBTDJILElBQU0sMkNBQTJDO0FBUTFNLElBQU0sYUFBYSxjQUFjLHdDQUFlO0FBQ2hELElBQU0sWUFBWSxLQUFLLFFBQVEsVUFBVTtBQUV6QyxJQUFPLHNCQUFRLGFB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
