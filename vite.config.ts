import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import svgr from 'vite-plugin-svgr'
import viteTsconfig from 'vite-tsconfig-paths'
const tsconfigPaths = viteTsconfig
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          floatPrecision: 2,
        },
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'popover.html'),
        settings: resolve(__dirname, 'settings.html')
      },
    },
  },
})
