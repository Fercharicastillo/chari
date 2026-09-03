import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist-embed",
    emptyOutDir: true,
    lib: {
      entry: "src/embed.tsx",
      formats: ["es"],
      fileName: () => "simulador-movimiento-parabolico.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
