import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Add this to plugins
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@store": path.resolve(__dirname, "./src/store"),
    },
  },
  server: {
    port: 5173,
    host: true,
    // HTTPS Configuration using backend certificates
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../backend/certs/localhost.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "../backend/certs/localhost.crt")),
      ca: fs.readFileSync(path.resolve(__dirname, "../backend/certs/rootCA.pem")),
    },
    proxy: {
      "/api": {
        target: "https://localhost:5000",
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
      },
    },
  },
});
