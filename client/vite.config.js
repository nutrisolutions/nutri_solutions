import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: app deploys don't invalidate the browser cache for these.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@remix-run)[\\/]/.test(id)) {
            return "react-vendor";
          }
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils|lenis)[\\/]/.test(id)) {
            return "motion-vendor";
          }
          return undefined;
        }
      }
    }
  }
});
