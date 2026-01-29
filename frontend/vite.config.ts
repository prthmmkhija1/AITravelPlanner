import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: "../client/public",
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/Assets": {
        target: "file://",
        rewrite: (path) => path.replace(/^\/Assets/, "../Assets")
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, '../Assets')
    }
  }
});

