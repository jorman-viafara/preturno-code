import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // esto permite conexiones desde red local
    port: 5173  // opcional: podés fijar un puerto
  },
  preview: {
    host: 'bluelink.local',
    port: 4173, // o el que quieras
    allowedHosts: ['bluelink.local'],
  },
  base: '/preturno-admin/',
})
