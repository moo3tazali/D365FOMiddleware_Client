import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Unfonts from 'unplugin-fonts/vite';

import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routeToken: 'layout',
      indexToken: 'page',
    }),
    Unfonts({
      custom: {
        families: [
          {
            name: 'Cairo',
            local: 'Cairo',
            src: [
              './src/assets/fonts/Cairo-Regular.woff2',
              './src/assets/fonts/Cairo-Medium.woff2',
              './src/assets/fonts/Cairo-SemiBold.woff2',
              './src/assets/fonts/Cairo-Bold.woff2',
              './src/assets/fonts/Cairo-ExtraBold.woff2',
              './src/assets/fonts/Cairo-Light.woff2',
            ],
          },
        ],
        display: 'swap',
        preload: false,
        prefetch: false,
        injectTo: 'head-prepend',
      },
    }),
    viteReact(),
    tailwindcss(),
    visualizer({ open: true }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // TanStack libraries
          'tanstack-vendor': [
            '@tanstack/react-query',
            '@tanstack/react-router',
            '@tanstack/react-table',
            '@tanstack/router-plugin',
          ],

          // Radix UI components (only installed packages)
          'radix-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
          ],

          // Form libraries
          'forms-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'react-dropzone',
          ],

          // Utility libraries
          'utils-vendor': [
            'tailwind-merge',
            'clsx',
            'class-variance-authority',
            'lucide-react',
          ],

          // Storage and state
          'storage-vendor': ['dexie'],

          // HTTP and API
          'http-vendor': ['axios'],

          // Additional libraries
          'misc-vendor': [
            'react-hot-toast',
            'react-error-boundary',
            'react-cookie',
            'universal-cookie',
            'jose',
            'object-to-formdata',
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
