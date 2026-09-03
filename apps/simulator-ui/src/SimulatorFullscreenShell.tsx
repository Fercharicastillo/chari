import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

export type SimulatorFullscreenNotice = {
  title: ReactNode;
  message: ReactNode;
  dismissLabel?: string;
};

type SimulatorFullscreenShellProps = ComponentPropsWithoutRef<"main"> & {
  isFullscreen: boolean;
  compatibilityNoticeVisible?: boolean;
  compatibilityNotice?: SimulatorFullscreenNotice;
  onDismissCompatibilityNotice?: () => void;
};

const SimulatorFullscreenShell = forwardRef<
  HTMLElement,
  SimulatorFullscreenShellProps
>(function SimulatorFullscreenShell(
  {
    isFullscreen,
    compatibilityNoticeVisible = false,
    compatibilityNotice,
    onDismissCompatibilityNotice,
    className = "",
    children,
    ...props
  },
  ref,
) {
  const clases = [
    "simulator-fullscreen-shell",
    className,
    isFullscreen ? "is-fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main ref={ref} className={clases} {...props}>
      {compatibilityNoticeVisible && compatibilityNotice && (
        <div className="simulator-fullscreen-notice">
          <div role="status" aria-live="polite">
            <strong>{compatibilityNotice.title}</strong>
            <span>{compatibilityNotice.message}</span>
          </div>
          {onDismissCompatibilityNotice && (
            <button
              type="button"
              aria-label={compatibilityNotice.dismissLabel ?? "Cerrar aviso"}
              onClick={onDismissCompatibilityNotice}
            >
              ×
            </button>
          )}
        </div>
      )}
      {children}
    </main>
  );
});

export default SimulatorFullscreenShell;
