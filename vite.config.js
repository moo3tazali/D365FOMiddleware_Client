import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Unfonts from 'unplugin-fonts/vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

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
            src: './src/assets/fonts/Cairo-*.ttf',
          },
        ],
        display: 'swap',
        preload: true,
        prefetch: false,
        injectTo: 'head-prepend',
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
