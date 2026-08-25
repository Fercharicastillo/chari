import disminuirIcon from "./assets/btn-left.svg";
import aumentarIcon from "./assets/btn-right.svg";

interface SimulatorParameterProps {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
  decimals?: number;
  onChange: (value: number) => void;
}

function contarDecimales(valor: number): number {
  const texto = valor.toString();
  return texto.includes(".") ? texto.split(".")[1].length : 0;
}

function SimulatorParameter({
  id,
  label,
  symbol,
  unit,
  min,
  max,
  step,
  value,
  disabled,
  decimals,
  onChange,
}: SimulatorParameterProps) {
  const decimales = contarDecimales(step);
  const decimalesSalida = decimals ?? Math.max(2, decimales);

  function ajustar(direccion: -1 | 1) {
    const siguiente = Math.min(max, Math.max(min, value + direccion * step));
    onChange(Number(siguiente.toFixed(decimales)));
  }

  return (
    <section className="simulator-parameter" aria-labelledby={`${id}-label`}>
      <div className="simulator-parameter__header">
        <label id={`${id}-label`} htmlFor={id}>
          <strong>{label}</strong> <small>({symbol})</small>
        </label>
        <output htmlFor={id}>
          {value.toFixed(decimalesSalida)} {unit}
        </output>
      </div>

      <div className="simulator-parameter__control">
        <button
          type="button"
          className="parameter-step-button"
          onClick={() => ajustar(-1)}
          disabled={disabled || value <= min}
          aria-label={`Disminuir ${label.toLowerCase()}`}
        >
          <img src={disminuirIcon} alt="" draggable="false" aria-hidden="true" />
        </button>

        <div className="simulator-range">
          <span className="simulator-range__limit">{min}</span>
          <span className="simulator-range__limit">{max}</span>
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </div>

        <button
          type="button"
          className="parameter-step-button"
          onClick={() => ajustar(1)}
          disabled={disabled || value >= max}
          aria-label={`Aumentar ${label.toLowerCase()}`}
        >
          <img src={aumentarIcon} alt="" draggable="false" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default SimulatorParameter;
