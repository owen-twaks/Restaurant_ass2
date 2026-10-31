import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Vite sometimes cannot resolve plain relative '.js' imports,
      // so point every data import to the real file.
      './data/menu.js': path.resolve(__dirname, 'src/data/menu.js'),
    },
  },
})
