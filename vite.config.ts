import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Fix for react-dom/client resolution issues in some dependencies
      "react-dom": "react-dom/client",
    },
  },
  // CRITICAL: Exclude Leaflet packages from optimization/pre-bundling
  optimizeDeps: {
    exclude: ['leaflet', 'react-leaflet'],
    // Include Leaflet to ensure it's pre-bundled correctly as CommonJS
    include: ['leaflet'],
  },
}));