# Simulador de caída libre de Physikós

Aplicación React para digitalizar la práctica de caída libre. El prototipo
reutiliza `@physikos/simulator-ui`, fija la referencia geométrica de la altura
y permite ajustar el conjunto superior del montaje.

## Alcance actual

- Estructura independiente e integrada mediante Shadow DOM.
- Encabezado, instrucciones y pantalla completa compartidos visualmente.
- Parámetro de altura entre 0,20 m y 0,50 m.
- Modelo físico aislado en `src/physics/caidaLibre.ts`.
- Ecuación renderizada con KaTeX.
- Montaje estático compuesto con los SVG del soporte, regla, señaladores,
  disparador, esfera, platillo receptor y Timer 4-4.
- Mesa de trabajo construida como una capa HTML independiente del fondo.
- Geometría normalizada en `src/scene/geometriaLaboratorio.ts`.
- Control de altura sincronizado mediante deslizador y arrastre vertical.
- Movimiento conjunto del disparador, la esfera y el señalador superior.
- Límites de altura entre 0,20 m y 0,50 m, con control por teclado accesible.
- Caída progresiva desde el reposo calculada con `g = 9,81 m/s²`.
- Controles reutilizables para liberar, pausar, avanzar `0,01 s` y volver a
  retener la esfera sin modificar la altura configurada.
- Timer 4-4 funcional: el canal 1 mide desde la liberación hasta el contacto
  con el platillo y su botón físico reinicia únicamente la lectura.
- Conjuntos superior e inferior ajustables de forma independiente sobre el eje
  vertical, cada uno sincronizado con su señalador en la regla.
- Altura calculada como diferencia entre ambas lecturas, con límites que evitan
  cruces, separaciones inválidas y salidas del tramo útil.
- Lecturas compactas `xₛ` y `xᵢ` alineadas con los señaladores y actualizadas
  durante el arrastre o al utilizar el control de altura.
- Escala métrica calibrada con el `viewBox` real de la regleta: la separación
  visual entre señaladores coincide con `xₛ - xᵢ` en todos los niveles de zoom.
  La zona graduada se toma entre las marcas SVG reales `y=67` (100 cm) y
  `y=1796.18` (0 cm), excluyendo la base decorativa inferior.
- Timer 4-4 arrastrable dentro de los límites de la mesa, con movimiento por
  puntero y teclado. El reinicio completo restaura su posición original; su
  botón integrado continúa reiniciando únicamente los contadores.
- Selector global de Cámara Normal (`1×`) y Cámara Lenta (`0,25×`). La cámara
  lenta prolonga la representación visual sin alterar el tiempo físico final.
- Indicadores luminosos coordinados: el disparador cambia de amarillo a verde
  al liberar la esfera y permanece así durante la pausa; al completar la caída
  vuelve a amarillo. El platillo permanece rojo hasta recibir la esfera,
  momento en el que cambia a verde.
- Módulo global “Mostrar” con controles para el Timer 4-4, la regleta con sus
  señaladores y el rastro temporal de la esfera. Las marcas del rastro se toman
  a intervalos físicos iguales para hacer visible la aceleración.
- Incertidumbre máxima configurable entre `0 %` y `15 %`. Cada nueva medición
  sortea una desviación relativa independiente dentro del intervalo elegido y
  la aplica únicamente a la lectura del Timer, no a la trayectoria ideal.
- Recursos educativos asociados mediante el módulo global: clase de Mecánica
  Newtoniana y guía PDF del laboratorio, abiertas en pestañas independientes.

## Integración con Physikós

La entrada `src/embed.tsx` se monta dentro de
`contenido/simuladores/sim_caida_libre.html` mediante Shadow DOM. La página
anfitriona proporciona las rutas de la clase, la guía y PDF.js mediante
atributos `data-*`. El bundle integrado se genera manualmente con
`npm.cmd run build:embed` desde esta aplicación.
- Zoom interno de `100 %`, `150 %` y `200 %`, con enfoque automático sobre el
  montaje o el Timer 4-4 sin ampliar el resto de la página.
- Navegación por arrastre bidireccional dentro del visor ampliado, conservando
  el arrastre vertical independiente de los instrumentos.
- Reinicio global independiente: restaura el montaje, la esfera, el Timer y la
  vista inicial, mientras los reinicios parciales conservan su alcance propio.

Los canales restantes se conservan disponibles para futuras variantes del
experimento.
