import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "katex/dist/katex.min.css";
import "@physikos/simulator-ui/styles.css";
import App from "./App";
import "./styles.css";

const recursosIndependientes = {
  claseUrl:
    "https://fercharicastillo.github.io/chari/contenido/repositorio_planes/rp_mecanica_newtoniana.html",
  guiaId: "guia-laboratorio-caida-libre",
  guiaPdfUrl: "./caida-libre-guia-de-laboratorio.pdf",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App recursos={recursosIndependientes} />
  </StrictMode>,
);
