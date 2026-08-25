import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
} from "react";

function unirClases(base: string, adicional?: string) {
  return adicional ? `${base} ${adicional}` : base;
}

type PanelProps = ComponentPropsWithoutRef<"section">;

export function SimulatorExperimentPanel({
  className,
  ...props
}: PanelProps) {
  return (
    <section
      className={unirClases(
        "simulator-experiment-panel simulator-card",
        className,
      )}
      {...props}
    />
  );
}

export function SimulatorLabStage({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={unirClases("simulator-lab-stage", className)}>
      {children}
    </div>
  );
}

type ViewportProps = ComponentPropsWithoutRef<"div">;

export const SimulatorSceneViewport = forwardRef<
  HTMLDivElement,
  ViewportProps
>(function SimulatorSceneViewport({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={unirClases("simulator-scene-viewport", className)}
      {...props}
    />
  );
});

type TransportProps = ComponentPropsWithoutRef<"div">;

export const SimulatorExperimentTransport = forwardRef<
  HTMLDivElement,
  TransportProps
>(function SimulatorExperimentTransport({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={unirClases(
        "simulator-experiment-transport transport-controls",
        className,
      )}
      {...props}
    />
  );
});
