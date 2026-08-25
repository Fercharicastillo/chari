import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import {
  SimulatorLoaderReady,
  type RecursosSimulador,
} from "@physikos/simulator-ui";
import estilosKatex from "katex/dist/katex.min.css?inline";
import estilosCompartidos from "@physikos/simulator-ui/styles.css?inline";
import estilosSimulador from "./styles.css?inline";

const selectorHost = "[data-physikos-simulador-mruv]";
const host = document.querySelector<HTMLElement>(selectorHost);

if (!host) {
  console.error(
    `No se encontró el punto de montaje del simulador MRUV: ${selectorHost}`,
  );
} else {
  const sombra = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  const estilos = document.createElement("style");
  const raiz = document.createElement("div");

  const sincronizarTema = () => {
    const modoOscuro =
      document.documentElement.getAttribute("cambio") === "darkMode";
    host.dataset.theme = modoOscuro ? "dark" : "light";
  };

  const observadorTema = new MutationObserver(sincronizarTema);
  observadorTema.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["cambio"],
  });
  sincronizarTema();

  const recursos: RecursosSimulador = {
    claseUrl: host.dataset.urlClase || undefined,
    guiaId: host.dataset.guiaId || undefined,
    guiaPdfUrl: host.dataset.urlGuiaPdf || undefined,
    visorPdfUrl: host.dataset.urlVisorPdf || undefined,
  };

  const estilosCompartidosIntegrados = estilosCompartidos.replace(
    /^:root\s*\{/m,
    ":host {",
  );
  const estilosSimuladorIntegrado = estilosSimulador.replace(
    /^:root\s*\{/m,
    ":host {",
  );

  estilos.textContent = `${estilosKatex}\n${estilosCompartidosIntegrados}\n${estilosSimuladorIntegrado}`;
  raiz.id = "simulador-mruv-root";
  sombra.replaceChildren(estilos, raiz);

  createRoot(raiz).render(
    <StrictMode>
      <SimulatorLoaderReady />
      <App integrado recursos={recursos} />
    </StrictMode>,
  );
}
