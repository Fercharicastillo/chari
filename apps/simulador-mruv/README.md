# Simulador MRUV de Physikos

Primera versión del laboratorio virtual de movimiento rectilíneo uniformemente variado en pista neumática.

## Qué incluye esta etapa

- Movimiento calculado con `x(t) = x0 + v0·t + ½a·t²`.
- Configuración de posición, velocidad inicial y aceleración.
- Cuatro sensores con posiciones configurables.
- Carrito con dos marcadores ópticos y proporciones tomadas de su SVG.
- Cronómetro del intervalo entre el paso del marcador delantero y el trasero.
- Segundo modo: tiempo acumulado desde la liberación hasta cada sensor.
- Botones Iniciar/Pausar alternados en una misma posición.
- Reinicio corto del movimiento sin alterar la configuración y reinicio total del simulador.
- Avance manual de la simulación en pasos físicos de `0,01 s`.
- Disparador para liberar el carrito y estado visible del equipo.
- Controles para mostrar u ocultar contador, sensores y ejes.
- Sensores arrastrables sobre la pista, sincronizados con sus controles.
- Ajuste accesible de los sensores mediante las flechas del teclado.
- Rastro visual opcional con posiciones tomadas a intervalos iguales de tiempo.
- Reproducción a `1×`, `0,5×` o `0,25×` sin alterar los tiempos físicos.
- Haz visual alineado con el receptor negro de cada sensor.
- Carrito arrastrable para configurar `x₀` a lo largo de los `2 m` de la pista.
- Sensores colocables libremente entre `0 m` y `2 m`; la validación del ensayo se mantiene separada del arrastre.
- Referencia `x₀`/`x(t)` alineada con el marcador delantero del carrito y con el eje.
- Componente visual compacto del Timer 4-4 integrado desde su SVG, sin conexiones físicas innecesarias.
- Cuatro pantallas dinámicas conectadas con las mediciones de sus respectivos sensores.
- Parámetros reutilizables con deslizador, límites y botones de ajuste propios de los simuladores Physikos.
- Casillas y controles de transporte personalizados, adaptados de la interfaz del simulador de MRU.
- Animación del SVG mediante `translate3d`, separada del renderizado de React.

Los dos modos de medición de la guía ya están disponibles. Todavía falta ampliar la experiencia visual y completar las opciones propias del equipo.

## Cómo ejecutarlo

Abre una terminal en esta carpeta y ejecuta:

```powershell
npm install
npm run dev
```

Vite mostrará una dirección local, normalmente `http://localhost:5173/`.

## Integración dentro de Physikós

El simulador tiene una segunda entrada para montarse dentro de
`contenido/simuladores/sim_mruv.html`. En esta modalidad, el HTML principal de
Physikós conserva el encabezado, el menú lateral, el modo oscuro y el pie de
página; React renderiza únicamente la aplicación MRUV.

Después de modificar el simulador, genera manualmente el archivo integrado con:

```powershell
npm run build:embed
```

El resultado se escribe en `dist-embed/simulador-mruv.js`. Ese nombre permanece
estable para que `sim_mruv.html` no tenga que modificarse después de cada
compilación. Los recursos importados por React se resuelven desde el propio
bundle. El punto de montaje vive en un Shadow DOM para impedir que los estilos
del simulador alteren el menú o que los estilos generales de Physikós alteren
los controles del laboratorio.

La entrada independiente importa directamente `katex.min.css`. La entrada
integrada inserta esa misma hoja dentro del Shadow DOM para conservar tanto la
tipografía matemática como el aislamiento de estilos.

Los recursos educativos asociados se configuran mediante los atributos
`data-url-clase` y `data-guia-id` del punto de montaje de `sim_mruv.html`.
`embed.tsx` los transforma en las propiedades de `RecursosSimulador`, por lo
que cambiar una ruta o un identificador no obliga a recompilar React.
`data-url-visor-pdf` indica qué instalación de PDF.js debe abrir la guía y
`data-url-guia-pdf` señala el documento concreto. El PDF de la práctica se
conserva en `public/guias-laboratorio/mruv-guia-laboratorio.pdf`; Vite lo copia
como archivo público sin convertirlo en una URL `data:`.

La entrada habitual (`npm run dev` o `npm run build`) continúa disponible como
versión independiente y reutiliza el mismo componente.

## Cómo está organizado

- `src/physics/movimiento.ts`: contiene únicamente las ecuaciones físicas.
- `src/physics/*.svg`: contiene el fondo, el carrito y el sensor utilizados por la escena.
- `../simulator-ui/`: paquete compartido con los controles, parámetros, KaTeX,
  enlaces educativos, tipos y estilos visuales de los simuladores Physikós.
- `src/components/Timer44.tsx`: conserva el Timer 4-4 específico de la escena
  actual; su generalización se realizará cuando exista el caso de caída libre.
- `src/App.tsx`: controla el ensayo y construye la interfaz.
- `src/styles.css`: contiene únicamente la escena, los instrumentos y el
  responsive específico de MRUV.

Mantener la física separada de la interfaz facilita estudiar el código y comprobar los cálculos.

Para este modo, el tiempo de paso se obtiene como la diferencia entre el instante
en que el borde delantero entra al sensor y el instante en que ha avanzado una
distancia `L` adicional. El estudiante puede calcular después `v = L / Δt`.

## Plantilla de recursos para otro simulador

El punto de montaje de cada simulador puede declarar sus recursos sin modificar
el bundle React:

```html
<div
  data-physikos-simulador
  data-url-clase="../repositorio_planes/ruta_de_la_clase.html"
  data-guia-id="guia-laboratorio-identificador"
  data-url-guia-pdf="../../apps/nombre-app/dist-embed/guias-laboratorio/guia.pdf"
  data-url-visor-pdf="../../visor_pdfs/web/viewer.html"
></div>
```

Los recursos de consulta se abren en otra pestaña para conservar el estado del
ensayo. El visor comienza en la primera página, ajusta el documento al ancho y
mantiene cerrado el panel lateral.
