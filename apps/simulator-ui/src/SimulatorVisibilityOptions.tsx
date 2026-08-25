import { SimulatorCheckbox } from "./SimulatorControls";

export type SimulatorVisibilityOption = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
};

type SimulatorVisibilityOptionsProps = {
  options: ReadonlyArray<SimulatorVisibilityOption>;
  onChange: (id: string, checked: boolean) => void;
  legend?: string;
  className?: string;
};

function SimulatorVisibilityOptions({
  options,
  onChange,
  legend = "Mostrar",
  className = "",
}: SimulatorVisibilityOptionsProps) {
  return (
    <fieldset
      className={`simulator-visibility-options${className ? ` ${className}` : ""}`}
    >
      <legend>{legend}</legend>
      {options.map((option) => (
        <SimulatorCheckbox
          key={option.id}
          label={option.label}
          checked={option.checked}
          disabled={option.disabled}
          onChange={(event) => onChange(option.id, event.target.checked)}
        />
      ))}
    </fieldset>
  );
}

export default SimulatorVisibilityOptions;
