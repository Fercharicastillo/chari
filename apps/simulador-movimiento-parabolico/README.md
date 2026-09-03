# Simulador de movimiento parabólico de Physikós

Aplicación React para digitalizar las prácticas de lanzamiento parabólico con
dispositivo balístico y mesa de impacto.

## Fase 1: estructura inicial

- Aplicación independiente dentro del workspace npm de simuladores.
- Entrada futura de integración mediante Shadow DOM.
- Encabezado, instrucciones y pantalla completa.
- Armazón compartido del laboratorio, visor y controles de transporte.
- Panel inicial para ángulo, velocidad y cámara.
- Opciones de visualización y recursos educativos.
- Espacios iniciales reservados para el dispositivo balístico y la mesa de
  impacto.

## Fase 2: montaje visual

- Composición realizada con los SVG creados en Adobe Illustrator y ubicados en
  `src/physics/assets`.
- Fondo de laboratorio, soporte, transportador y dispositivo balístico como
  capas independientes.
- Dispositivo balístico preparado para rotar alrededor de su pivote visual.
- Cuerpo de prueba situado sobre el punto de salida del dispositivo.
- Mesa de impacto, regla vertical y señaladores superior e inferior.
- Mesa de trabajo construida como capa HTML.
- Guía de laboratorio servida desde
  `public/guia-laboratorio-lanzamiento-de-proyectiles.pdf`.

Al finalizar esta fase, las posiciones todavía eran una composición visual
preliminar; la fase 3 reemplaza esos porcentajes independientes por una escala
geométrica común.

## Fase 3: geometría del escenario

- Lienzo interno de 1000 × 500 unidades con posiciones independientes del
  tamaño visible del navegador.
- Mesa de trabajo separada del fondo, con una línea de apoyo interior para que
  las bases de todos los instrumentos descansen visualmente sobre ella.
- Escala vertical derivada de las marcas 0 cm y 100 cm del SVG de la regla.
- Altura del tablero calculada a partir de su posición real sobre esa escala.
- Transportador y dispositivo vinculados a un mismo punto de salida móvil.
- Desplazamiento vertical conjunto del transportador y el dispositivo sobre el
  soporte mediante el control de altura.
- Giro independiente del dispositivo alrededor del punto de salida según el
  ángulo seleccionado.
- Señalador superior vinculado a la salida y señalador inferior vinculado al
  tablero de la mesa.
- Indicador de alineación entre la altura inicial de la esfera y la superficie
  de impacto.
- Trayectoria de referencia anclada al punto de salida y al nivel del tablero.

La trayectoria de esta fase solo comprueba los anclajes geométricos. El tiempo,
la posición instantánea, el alcance calculado y la detección final del impacto
se incorporarán con el modelo físico.

## Fase 4: motor físico

- Funciones puras para calcular las componentes horizontal y vertical de la
  velocidad.
- Posición bidimensional para cualquier instante.
- Tiempo de vuelo hasta una altura de impacto configurable.
- Alcance horizontal y punto de impacto.
- Altura máxima y tiempo en el que se alcanza.
- Soporte explícito para una salida y una mesa situadas a distintas alturas.
- Resultado `null` cuando el proyectil no puede alcanzar el nivel de impacto.
- Panel de resultados ideales independiente de la futura animación.
- Trayectoria estática conectada al cálculo físico y a la escala métrica del
  escenario.

El motor se encuentra en `src/physics/movimientoParabolico.ts`. No contiene
estado de React, temporizadores ni dependencias del DOM, por lo que podrá ser
reutilizado por la animación y por futuros módulos de medición.

## Fase 5: controles experimentales

- Ángulo limitado inicialmente al intervalo de 20° a 75° indicado por la
  práctica.
- Velocidad regulable entre 2 m/s y 5 m/s.
- Ajuste continuo de la velocidad mediante el deslizador.
- Lectura digital sincronizada en el dispositivo balístico.
- Validación del alcance vertical y de los límites físicos de la mesa.
- Advertencia cuando la salida no coincide con la altura del tablero.

Las validaciones se mantienen en
`src/physics/configuracionExperimento.ts`, separadas de React y de la futura
animación.

## Fase 6: animación

- Lanzamiento progresivo mediante `requestAnimationFrame`.
- Reloj físico independiente del tiempo real de reproducción.
- Pausa y continuación sin saltos de posición.
- Avance manual en pasos exactos de 0,01 s.
- Cámara normal a 1× y cámara lenta a 0,25×.
- Condiciones experimentales congeladas al comenzar cada ensayo.
- Finalización limitada al tiempo exacto y al punto calculado de impacto.
- Reinicio del movimiento conservando los parámetros.
- Reinicio completo de tiempo, estado, parámetros, cámara y visualización.

La animación solo consulta las funciones puras del motor físico; no contiene
una segunda implementación de las ecuaciones del movimiento.
