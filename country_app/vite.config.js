import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Forzar a plugin-react a pasar por Babel para poder usar @babel/preset-flow
      babel: {
        presets: ['@babel/preset-flow'],
      },
    }),
  ],
  server: {
    host: true,
  },
})
