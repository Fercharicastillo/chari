import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  // La salida en modo librería conserva algunas comprobaciones de React.
  // Se reemplaza NODE_ENV para que el bundle funcione directamente en el
  // navegador, donde el objeto global `process` no existe.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist-embed",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/embed.tsx"),
      formats: ["es"],
      fileName: () => "simulador-mruv.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
