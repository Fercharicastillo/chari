# Base de interfaz para simuladores

Este paquete reúne componentes que no dependen de la física ni de una escena
concreta. Es la biblioteca visual compartida de los simuladores de Physikós y
se consume como `@physikos/simulator-ui` desde el workspace `apps`.

El SVG del Timer 4-4 también vive en este paquete porque es un instrumento
utilizado por más de un laboratorio.

`src/simulator-ui.css` contiene la base visual común: estructura, encabezado,
instrucciones, botones, deslizadores, ecuaciones, panel de configuración y
recursos educativos. `styles.css` queda reservado para la pista, el carrito,
los sensores, el Timer 4-4 y los estados propios del experimento MRUV.

`SimulatorCameraMode` proporciona el selector global Cámara Normal/Cámara
Lenta. `SIMULATOR_CAMERA_SPEED` contiene sus factores de reproducción comunes:
`1×` y `0,25×`; cada simulador aplica el factor a su reloj de animación sin
alterar las magnitudes físicas calculadas.

`SimulatorCheckbox` representa una opción individual y
`SimulatorVisibilityOptions` construye el módulo global “Mostrar” a partir de
una lista de elementos visibles. De este modo cada simulador conserva su propio
estado, pero comparte estructura, accesibilidad y estilos.

`SimulatorParameter` admite la propiedad opcional `decimals` para adaptar la
precisión visible de la salida sin modificar el paso matemático del control.

`SimulatorResources` genera los enlaces globales asociados a cada simulador.
Incluye iconos predeterminados para recursos de tipo `clase` y `guia`, aunque
permite reemplazarlos cuando una aplicación necesite una variante propia.

Cada aplicación carga primero esta hoja y después sus estilos específicos. Las
entradas integradas insertan ambas dentro del mismo Shadow DOM y convierten sus
selectores `:root` en `:host`.
