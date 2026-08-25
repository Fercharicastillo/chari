import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

interface SimulatorIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: string;
  label: string;
  shape?: "square" | "round";
}

function SimulatorIconButton({
  icon,
  label,
  shape = "square",
  className = "",
  ...buttonProps
}: SimulatorIconButtonProps) {
  return (
    <button
      {...buttonProps}
      className={`simulator-icon-button simulator-icon-button--${shape} ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <img src={icon} alt="" draggable="false" aria-hidden="true" />
    </button>
  );
}

interface SimulatorCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

function SimulatorCheckbox({ label, ...inputProps }: SimulatorCheckboxProps) {
  return (
    <label className="simulator-checkbox">
      <input {...inputProps} type="checkbox" />
      <span className="simulator-checkbox__mark" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export { SimulatorCheckbox, SimulatorIconButton };
