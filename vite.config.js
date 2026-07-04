import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    // Einzelne HTML-Ausgabe für Cloudflare Pages
    rollupOptions: {
      output: {
        // Alles in eine JS-Datei bündeln (wie bisher index.html)
        manualChunks: undefined,
      }
    },
    // Kein CSS-Code-Splitting – alles inline
    cssCodeSplit: false,
  },
  // Base-Pfad für Cloudflare Pages
  base: '/',
})


