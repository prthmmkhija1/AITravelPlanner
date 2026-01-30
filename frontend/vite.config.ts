import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  publicDir: "../client/public",
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    }
  }
});

