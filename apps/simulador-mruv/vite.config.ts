import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Las rutas relativas permiten publicar el resultado dentro de Physikos.
  base: "./",
});
