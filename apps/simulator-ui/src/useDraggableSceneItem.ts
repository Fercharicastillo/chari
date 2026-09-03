import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

export type ScenePosition = {
  x: number;
  y: number;
};

export type UseDraggableSceneItemOptions<T extends HTMLElement> = {
  position: ScenePosition;
  onPositionChange: (position: ScenePosition) => void;
  getScenePosition: (clientX: number, clientY: number) => ScenePosition | null;
  constrainPosition?: (position: ScenePosition) => ScenePosition;
  initialPosition?: ScenePosition | (() => ScenePosition);
  keyboardStep?: number | ScenePosition;
  disabled?: boolean;
  ignorePointerSelector?: string;
  keyboardTargetSelfOnly?: boolean;
  onDragStart?: (position: ScenePosition, event: PointerEvent<T>) => void;
  onDragEnd?: (
    position: ScenePosition,
    event: PointerEvent<T>,
  ) => ScenePosition | void;
  onKeyboardMove?: (position: ScenePosition, key: string) => void;
  onReset?: (position: ScenePosition) => void;
};

type ActiveDrag = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

export default function useDraggableSceneItem<
  T extends HTMLElement = HTMLElement,
>(options: UseDraggableSceneItemOptions<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const positionRef = useRef(options.position);
  const optionsRef = useRef(options);

  positionRef.current = options.position;
  optionsRef.current = options;

  const applyPosition = useCallback((candidate: ScenePosition) => {
    const currentOptions = optionsRef.current;
    const nextPosition = currentOptions.constrainPosition
      ? currentOptions.constrainPosition(candidate)
      : candidate;
    positionRef.current = nextPosition;
    currentOptions.onPositionChange(nextPosition);
    return nextPosition;
  }, []);

  const cancelDrag = useCallback(() => {
    activeDragRef.current = null;
    setIsDragging(false);
  }, []);

  const onPointerDown = useCallback(
    (event: PointerEvent<T>) => {
      const currentOptions = optionsRef.current;
      if (
        currentOptions.disabled ||
        (event.pointerType === "mouse" && event.button !== 0) ||
        (currentOptions.ignorePointerSelector &&
          event.target instanceof Element &&
          event.target.closest(currentOptions.ignorePointerSelector))
      ) {
        return;
      }

      const pointerPosition = currentOptions.getScenePosition(
        event.clientX,
        event.clientY,
      );
      if (!pointerPosition) return;

      activeDragRef.current = {
        pointerId: event.pointerId,
        offsetX: pointerPosition.x - positionRef.current.x,
        offsetY: pointerPosition.y - positionRef.current.y,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      currentOptions.onDragStart?.(positionRef.current, event);
      event.preventDefault();
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<T>) => {
      const activeDrag = activeDragRef.current;
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

      const pointerPosition = optionsRef.current.getScenePosition(
        event.clientX,
        event.clientY,
      );
      if (!pointerPosition) return;

      applyPosition({
        x: pointerPosition.x - activeDrag.offsetX,
        y: pointerPosition.y - activeDrag.offsetY,
      });
      event.preventDefault();
    },
    [applyPosition],
  );

  const onPointerEnd = useCallback(
    (event: PointerEvent<T>) => {
      const activeDrag = activeDragRef.current;
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      let finalPosition = positionRef.current;
      const pointerPosition = optionsRef.current.getScenePosition(
        event.clientX,
        event.clientY,
      );
      if (pointerPosition) {
        finalPosition = applyPosition({
          x: pointerPosition.x - activeDrag.offsetX,
          y: pointerPosition.y - activeDrag.offsetY,
        });
      }

      const adjustedPosition = optionsRef.current.onDragEnd?.(
        finalPosition,
        event,
      );
      if (adjustedPosition) applyPosition(adjustedPosition);
      cancelDrag();
    },
    [applyPosition, cancelDrag],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<T>) => {
      const currentOptions = optionsRef.current;
      if (
        currentOptions.disabled ||
        (currentOptions.keyboardTargetSelfOnly &&
          event.target !== event.currentTarget)
      ) {
        return;
      }

      if (event.key === "Home" && currentOptions.initialPosition) {
        const initialPosition =
          typeof currentOptions.initialPosition === "function"
            ? currentOptions.initialPosition()
            : currentOptions.initialPosition;
        const nextPosition = applyPosition(initialPosition);
        currentOptions.onReset?.(nextPosition);
        event.preventDefault();
        return;
      }

      const step = currentOptions.keyboardStep ?? 1;
      const stepX = typeof step === "number" ? step : step.x;
      const stepY = typeof step === "number" ? step : step.y;
      let deltaX = 0;
      let deltaY = 0;

      if (event.key === "ArrowLeft") deltaX = -stepX;
      else if (event.key === "ArrowRight") deltaX = stepX;
      else if (event.key === "ArrowUp") deltaY = -stepY;
      else if (event.key === "ArrowDown") deltaY = stepY;
      else return;

      const nextPosition = applyPosition({
        x: positionRef.current.x + deltaX,
        y: positionRef.current.y + deltaY,
      });
      currentOptions.onKeyboardMove?.(nextPosition, event.key);
      event.preventDefault();
    },
    [applyPosition],
  );

  return {
    isDragging,
    cancelDrag,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onKeyDown,
    },
  };
}
