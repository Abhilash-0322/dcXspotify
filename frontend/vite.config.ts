import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/@clerk/")) return "clerk-vendor";
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react-vendor";
          if (/\/node_modules\/(lucide-react|@radix-ui)\//.test(id)) return "ui-vendor";
          if (id.includes("/node_modules/")) return "vendor";
        },
      },
    },
  },
  server:{
    port: 3000,
  }
});
