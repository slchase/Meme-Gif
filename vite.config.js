import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 1234, // Use the same port as Parcel
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});