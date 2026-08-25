import iconoGuiaPdf from "./assets/resource-pdf.svg";
import iconoVerClase from "./assets/resource-view.svg";

export type RecursoSimulador = {
  id: string;
  etiqueta: string;
  url?: string;
  icono?: string;
  tipo?: "clase" | "guia";
  abrirEnNuevaPestana?: boolean;
};

type SimulatorResourcesProps = {
  recursos: RecursoSimulador[];
};

/** Enlaces educativos asociados a un simulador de Physikós. */
function SimulatorResources({ recursos }: SimulatorResourcesProps) {
  const recursosDisponibles = recursos.filter(
    (recurso): recurso is RecursoSimulador & { url: string } =>
      Boolean(recurso.url),
  );

  if (recursosDisponibles.length === 0) return null;

  return (
    <nav
      className="learning-note__actions"
      aria-label="Recursos relacionados con el simulador"
    >
      {recursosDisponibles.map((recurso) => {
        const nuevaPestana = recurso.abrirEnNuevaPestana === true;
        const icono =
          recurso.icono ||
          (recurso.tipo === "guia" ? iconoGuiaPdf : iconoVerClase);

        return (
          <a
            key={recurso.id}
            className="learning-resource-link"
            href={recurso.url}
            target={nuevaPestana ? "_blank" : undefined}
            rel={nuevaPestana ? "noopener noreferrer" : undefined}
            data-recurso-id={recurso.id}
          >
            <img src={icono} alt="" aria-hidden="true" />
            <span>{recurso.etiqueta}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default SimulatorResources;
