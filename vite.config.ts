import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // React rarely changes, so it gets its own long-lived cached chunk.
        manualChunks: { react: ["react", "react-dom"] },
      },
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
