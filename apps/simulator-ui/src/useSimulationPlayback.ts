import { useCallback, useEffect, useRef, useState } from "react";

export type SimulationPlaybackState =
  | "ready"
  | "running"
  | "paused"
  | "completed";

export type UseSimulationPlaybackOptions = {
  getDuration: () => number | null;
  playbackRate?: number;
  step?: number;
  onPrepare?: () => void;
  onComplete?: () => void;
};

export default function useSimulationPlayback({
  getDuration,
  playbackRate = 1,
  step = 0.01,
  onPrepare,
  onComplete,
}: UseSimulationPlaybackOptions) {
  const [time, setTime] = useState(0);
  const [state, setState] = useState<SimulationPlaybackState>("ready");
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameRef = useRef(0);
  const currentTimeRef = useRef(0);
  const preparedRef = useRef(false);
  const completedRef = useRef(false);
  const playbackRateRef = useRef(playbackRate);
  const callbacksRef = useRef({ getDuration, onPrepare, onComplete });

  playbackRateRef.current = playbackRate;
  callbacksRef.current = { getDuration, onPrepare, onComplete };

  const prepare = useCallback(() => {
    if (preparedRef.current) return;
    callbacksRef.current.onPrepare?.();
    preparedRef.current = true;
  }, []);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    previousFrameRef.current = 0;
    setState("completed");
    callbacksRef.current.onComplete?.();
  }, []);

  useEffect(() => {
    if (state !== "running") return;

    const animate = (timestamp: number) => {
      const duration = callbacksRef.current.getDuration();
      if (duration === null) {
        setState("ready");
        return;
      }

      if (previousFrameRef.current === 0) {
        previousFrameRef.current = timestamp;
      }

      const elapsed =
        ((timestamp - previousFrameRef.current) / 1000) *
        playbackRateRef.current;
      previousFrameRef.current = timestamp;

      const nextTime = Math.min(currentTimeRef.current + elapsed, duration);
      currentTimeRef.current = nextTime;
      setTime(nextTime);

      if (nextTime >= duration) {
        complete();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [complete, state]);

  const start = useCallback(() => {
    if (completedRef.current) return;
    prepare();

    const duration = callbacksRef.current.getDuration();
    if (duration === null) return;
    if (currentTimeRef.current >= duration) {
      complete();
      return;
    }

    previousFrameRef.current = 0;
    setState("running");
  }, [complete, prepare]);

  const pause = useCallback(() => {
    if (state !== "running") return;
    previousFrameRef.current = 0;
    setState("paused");
  }, [state]);

  const advance = useCallback(() => {
    if (state === "running" || completedRef.current) return;
    prepare();

    const duration = callbacksRef.current.getDuration();
    if (duration === null) return;

    const nextTime = Math.min(currentTimeRef.current + step, duration);
    currentTimeRef.current = nextTime;
    previousFrameRef.current = 0;
    setTime(nextTime);

    if (nextTime >= duration) complete();
    else setState("paused");
  }, [complete, prepare, state, step]);

  const reset = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    previousFrameRef.current = 0;
    currentTimeRef.current = 0;
    preparedRef.current = false;
    completedRef.current = false;
    setTime(0);
    setState("ready");
  }, []);

  return {
    time,
    state,
    start,
    pause,
    advance,
    reset,
  };
}
