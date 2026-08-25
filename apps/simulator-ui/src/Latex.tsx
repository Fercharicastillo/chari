import { useLayoutEffect, useRef } from "react";
import katex from "katex";

type LatexProps = {
  formula: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
};

/** Renderiza una expresión TeX con KaTeX sin modificar nodos de React. */
function Latex({
  formula,
  displayMode = false,
  className,
  ariaLabel,
}: LatexProps) {
  const contenedorRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    katex.render(formula, contenedor, {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
      strict: "warn",
      trust: false,
    });
  }, [displayMode, formula]);

  return (
    <span
      ref={contenedorRef}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

export default Latex;
