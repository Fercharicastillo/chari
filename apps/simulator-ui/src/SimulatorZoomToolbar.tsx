export type SimulatorZoomFocusOption<T extends string = string> = {
  id: T;
  label: string;
  disabled?: boolean;
};

type SimulatorZoomToolbarProps<T extends string> = {
  zoom: number;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  activeFocus: T;
  focusOptions: readonly SimulatorZoomFocusOption<T>[];
  onFocusChange: (focus: T) => void;
};

function SimulatorZoomToolbar<T extends string>({
  zoom,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  activeFocus,
  focusOptions,
  onFocusChange,
}: SimulatorZoomToolbarProps<T>) {
  return (
    <div
      className="simulator-zoom-toolbar"
      aria-label="Controles de ampliación"
    >
      <span className="simulator-zoom-toolbar__label">Zoom</span>
      <button
        type="button"
        className="simulator-zoom-button"
        aria-label="Reducir zoom"
        disabled={!canDecrease}
        onClick={onDecrease}
      >
        −
      </button>
      <output className="simulator-zoom-value" aria-live="polite">
        {Math.round(zoom * 100)}%
      </output>
      <button
        type="button"
        className="simulator-zoom-button"
        aria-label="Aumentar zoom"
        disabled={!canIncrease}
        onClick={onIncrease}
      >
        +
      </button>

      {focusOptions.length > 0 && (
        <>
          <span
            className="simulator-zoom-toolbar__separator"
            aria-hidden="true"
          />
          {focusOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`simulator-zoom-focus${activeFocus === option.id ? " simulator-zoom-focus--active" : ""}`}
              aria-pressed={activeFocus === option.id}
              disabled={option.disabled}
              onClick={() => onFocusChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

export default SimulatorZoomToolbar;
