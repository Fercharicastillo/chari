import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export type ZoomPanPoint = {
  x: number;
  y: number;
};

export type ZoomPanSceneSize = {
  width: number;
  height: number;
};

export type UseZoomPanViewportOptions<TFocus extends string> = {
  zoomLevels: readonly number[];
  initialFocus: TFocus;
  sceneSize: ZoomPanSceneSize;
  resolveFocusCenter: (focus: TFocus) => ZoomPanPoint;
  fallbackFocus?: TFocus;
  unavailableFocuses?: readonly TFocus[];
  keyboardPanStep?: number;
  ignorePanSelector?: string;
};

type ActivePan = {
  pointerId: number;
  clientX: number;
  clientY: number;
  scrollLeft: number;
  scrollTop: number;
};

const DEFAULT_IGNORE_PAN_SELECTOR = "button, input, label, output";

export default function useZoomPanViewport<TFocus extends string>({
  zoomLevels,
  initialFocus,
  sceneSize,
  resolveFocusCenter,
  fallbackFocus = initialFocus,
  unavailableFocuses = [],
  keyboardPanStep = 50,
  ignorePanSelector = DEFAULT_IGNORE_PAN_SELECTOR,
}: UseZoomPanViewportOptions<TFocus>) {
  if (zoomLevels.length === 0) {
    throw new Error("useZoomPanViewport requiere al menos un nivel de zoom.");
  }

  const viewportRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const activePanRef = useRef<ActivePan | null>(null);
  const resolveFocusCenterRef = useRef(resolveFocusCenter);
  const sceneSizeRef = useRef(sceneSize);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [activeFocus, setActiveFocus] = useState(initialFocus);
  const [isPanning, setIsPanning] = useState(false);

  resolveFocusCenterRef.current = resolveFocusCenter;
  sceneSizeRef.current = sceneSize;

  const zoom = zoomLevels[zoomIndex] ?? zoomLevels[0];
  const isZoomed = zoom > zoomLevels[0];
  const canDecrease = zoomIndex > 0;
  const canIncrease = zoomIndex < zoomLevels.length - 1;
  const activeFocusUnavailable = unavailableFocuses.includes(activeFocus);

  const cancelPan = useCallback(() => {
    activePanRef.current = null;
    setIsPanning(false);
  }, []);

  const focusZone = useCallback(
    (focus: TFocus, behavior: ScrollBehavior = "smooth") => {
      const viewport = viewportRef.current;
      const scene = sceneRef.current;
      if (!viewport || !scene) return;

      const center = resolveFocusCenterRef.current(focus);
      const currentSceneSize = sceneSizeRef.current;
      const scaleX = scene.scrollWidth / currentSceneSize.width;
      const scaleY = scene.scrollHeight / currentSceneSize.height;

      viewport.scrollTo({
        left: center.x * scaleX - viewport.clientWidth / 2,
        top: center.y * scaleY - viewport.clientHeight / 2,
        behavior,
      });
    },
    [],
  );

  const selectFocus = useCallback((focus: TFocus) => {
    setActiveFocus(focus);
  }, []);

  const decreaseZoom = useCallback(() => {
    setZoomIndex((current) => Math.max(0, current - 1));
  }, []);

  const increaseZoom = useCallback(() => {
    setZoomIndex((current) =>
      Math.min(zoomLevels.length - 1, current + 1),
    );
  }, [zoomLevels.length]);

  const resetViewport = useCallback(() => {
    cancelPan();
    setZoomIndex(0);
    setActiveFocus(initialFocus);
    requestAnimationFrame(() => focusZone(initialFocus, "auto"));
  }, [cancelPan, focusZone, initialFocus]);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      focusZone(activeFocus, "auto"),
    );
    return () => cancelAnimationFrame(frame);
  }, [activeFocus, focusZone, zoomIndex]);

  useEffect(() => {
    if (activeFocusUnavailable) setActiveFocus(fallbackFocus);
  }, [activeFocus, activeFocusUnavailable, fallbackFocus]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (
        !isZoomed ||
        (event.pointerType === "mouse" && event.button !== 0) ||
        (event.target instanceof Element &&
          event.target.closest(ignorePanSelector))
      ) {
        return;
      }

      const viewport = event.currentTarget;
      activePanRef.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
      };
      viewport.setPointerCapture(event.pointerId);
      setIsPanning(true);
      event.preventDefault();
    },
    [ignorePanSelector, isZoomed],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const start = activePanRef.current;
      if (!start || start.pointerId !== event.pointerId) return;

      event.currentTarget.scrollLeft =
        start.scrollLeft - (event.clientX - start.clientX);
      event.currentTarget.scrollTop =
        start.scrollTop - (event.clientY - start.clientY);
      event.preventDefault();
    },
    [],
  );

  const onPointerEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const start = activePanRef.current;
      if (!start || start.pointerId !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      cancelPan();
    },
    [cancelPan],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isZoomed || event.defaultPrevented) return;

      let left = 0;
      let top = 0;
      if (event.key === "ArrowLeft") left = -keyboardPanStep;
      else if (event.key === "ArrowRight") left = keyboardPanStep;
      else if (event.key === "ArrowUp") top = -keyboardPanStep;
      else if (event.key === "ArrowDown") top = keyboardPanStep;
      else if (event.key === "Home") {
        focusZone(activeFocus);
        event.preventDefault();
        return;
      } else return;

      event.currentTarget.scrollBy({ left, top, behavior: "smooth" });
      event.preventDefault();
    },
    [activeFocus, focusZone, isZoomed, keyboardPanStep],
  );

  const sceneStyle: CSSProperties = {
    width: `${zoom * 100}%`,
    maxWidth: "none",
    marginInline: isZoomed ? 0 : "auto",
  };

  return {
    viewportRef,
    sceneRef,
    zoom,
    zoomIndex,
    activeFocus,
    isZoomed,
    isPanning,
    canDecrease,
    canIncrease,
    decreaseZoom,
    increaseZoom,
    selectFocus,
    focusZone,
    resetViewport,
    cancelPan,
    sceneStyle,
    viewportProps: {
      tabIndex: isZoomed ? 0 : -1,
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onKeyDown,
    },
  };
}
