import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-i18next'],
          'animation': ['gsap', 'three', '@dnd-kit/core', '@dnd-kit/sortable'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'fabric': ['fabric'],
          'utils': ['axios', 'zustand', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'axios'],
    exclude: ['@shared'],
  },
  worker: {
    format: 'es',
  },
});
