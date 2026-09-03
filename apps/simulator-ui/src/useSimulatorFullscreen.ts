import { useCallback, useEffect, useRef, useState } from "react";

export type UseSimulatorFullscreenOptions = {
  compatibilityMediaQuery?: string;
  compatibilityNoticeDuration?: number;
  onError?: (error: unknown) => void;
};

function obtenerElementoPantallaCompleta(elemento: HTMLElement | null) {
  const raiz = elemento?.getRootNode();
  return raiz instanceof ShadowRoot
    ? raiz.fullscreenElement
    : document.fullscreenElement;
}

export default function useSimulatorFullscreen<T extends HTMLElement>({
  compatibilityMediaQuery = "(pointer: coarse)",
  compatibilityNoticeDuration = 6000,
  onError,
}: UseSimulatorFullscreenOptions = {}) {
  const fullscreenRef = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compatibilityNoticeVisible, setCompatibilityNoticeVisible] =
    useState(false);

  const dismissCompatibilityNotice = useCallback(() => {
    setCompatibilityNoticeVisible(false);
  }, []);

  useEffect(() => {
    const elemento = fullscreenRef.current;
    if (!elemento) return;

    const raiz = elemento.getRootNode();
    const actualizarEstado = () => {
      const activo = obtenerElementoPantallaCompleta(elemento) === elemento;
      setIsFullscreen(activo);
      if (!activo) setCompatibilityNoticeVisible(false);
    };

    document.addEventListener("fullscreenchange", actualizarEstado);
    if (raiz instanceof ShadowRoot) {
      raiz.addEventListener("fullscreenchange", actualizarEstado);
    }
    actualizarEstado();

    return () => {
      document.removeEventListener("fullscreenchange", actualizarEstado);
      if (raiz instanceof ShadowRoot) {
        raiz.removeEventListener("fullscreenchange", actualizarEstado);
      }
    };
  }, []);

  useEffect(() => {
    if (!compatibilityNoticeVisible) return;

    const temporizador = window.setTimeout(
      dismissCompatibilityNotice,
      compatibilityNoticeDuration,
    );
    return () => window.clearTimeout(temporizador);
  }, [
    compatibilityNoticeDuration,
    compatibilityNoticeVisible,
    dismissCompatibilityNotice,
  ]);

  const toggleFullscreen = useCallback(async () => {
    const elemento = fullscreenRef.current;
    if (!elemento) return;

    try {
      const elementoActivo = obtenerElementoPantallaCompleta(elemento);
      if (!elementoActivo) {
        if (window.matchMedia(compatibilityMediaQuery).matches) {
          setCompatibilityNoticeVisible(true);
        }
        await elemento.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      if (onError) onError(error);
      else console.error("No se pudo cambiar el modo de pantalla completa:", error);
    }
  }, [compatibilityMediaQuery, onError]);

  return {
    fullscreenRef,
    isFullscreen,
    toggleFullscreen,
    compatibilityNoticeVisible,
    dismissCompatibilityNotice,
  };
}
