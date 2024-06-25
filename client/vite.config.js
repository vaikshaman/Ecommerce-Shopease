import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Replace with your backend API URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/upload": {
        target: "http://localhost:5000", // Replace with your upload endpoint URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, ""),
      },
    },
  },
});
