import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger";

// The Go backend listens on 8080 (configs/app.yaml -> server.http_port), so the
// dev server uses 5173 instead of colliding with it.
const BACKEND = process.env.VITE_BACKEND_ORIGIN ?? "http://localhost:8080";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      // Proxying keeps the browser same-origin in development, so the Go
      // server needs no CORS configuration.
      "/api": { target: BACKEND, changeOrigin: true },
      "/ws": { target: BACKEND, ws: true, changeOrigin: true },
    },
  },
  plugins: [
    react(),
    mode === 'development' 
    // && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
