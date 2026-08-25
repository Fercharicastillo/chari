import { useEffect } from "react";

const SELECTOR_LOADER = ".loader-page";
const DURACION_SALIDA_MS = 2000;

export default function SimulatorLoaderReady() {
  useEffect(() => {
    const loader = document.querySelector<HTMLElement>(SELECTOR_LOADER);

    if (!loader) {
      return;
    }

    loader.classList.add("loader-page--hidden");
    loader.setAttribute("aria-hidden", "true");

    const temporizador = window.setTimeout(() => {
      loader.hidden = true;
    }, DURACION_SALIDA_MS);

    return () => window.clearTimeout(temporizador);
  }, []);

  return null;
}
