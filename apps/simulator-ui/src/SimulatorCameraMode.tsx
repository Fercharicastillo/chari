import { useId } from "react";

export type SimulatorCameraModeValue = "normal" | "slow";

export const SIMULATOR_CAMERA_SPEED: Record<
  SimulatorCameraModeValue,
  number
> = {
  normal: 1,
  slow: 0.25,
};

type SimulatorCameraModeProps = {
  value: SimulatorCameraModeValue;
  onChange: (value: SimulatorCameraModeValue) => void;
  disabled?: boolean;
  className?: string;
};

const OPCIONES: ReadonlyArray<{
  value: SimulatorCameraModeValue;
  label: string;
}> = [
  { value: "normal", label: "Cámara Normal" },
  { value: "slow", label: "Cámara Lenta" },
];

function SimulatorCameraMode({
  value,
  onChange,
  disabled = false,
  className = "",
}: SimulatorCameraModeProps) {
  const identificador = useId();

  return (
    <fieldset
      className={`simulator-camera-mode${className ? ` ${className}` : ""}`}
      aria-label="Velocidad de la cámara"
      disabled={disabled}
    >
      {OPCIONES.map((opcion) => (
        <label key={opcion.value} className="simulator-camera-mode__option">
          <input
            type="radio"
            name={`${identificador}-camera-mode`}
            value={opcion.value}
            checked={value === opcion.value}
            onChange={() => onChange(opcion.value)}
          />
          <span className="simulator-camera-mode__mark" aria-hidden="true" />
          <span>{opcion.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export default SimulatorCameraMode;
