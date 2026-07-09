// CODEX: añadido para implementar el simulador MRU con canvas nativo y movimiento x(t)=x0+v*t
(function () {
  const elementos = {
    canvas: document.getElementById("canvas_simulador"),
    grafica: document.getElementById("mruGraph"),
    canvasPanel: document.querySelector(".mru-canvas-panel"),
    cronometro: document.getElementById("mru-cronometro"),
    cronoMin: document.getElementById("mru-crono-min"),
    cronoSec: document.getElementById("mru-crono-sec"),
    cronoMs: document.getElementById("mru-crono-ms"),
    cronoStart: document.getElementById("mru-crono-start"),
    cronoStop: document.getElementById("mru-crono-stop"),
    cronoRestart: document.getElementById("mru-crono-restart"),
    cronoRestartDisabled: document.getElementById("mru-crono-restart-disabled"),
    valorT: document.getElementById("mru-valor-t"),
    valorX: document.getElementById("mru-valor-x"),
    valorV: document.getElementById("mru-valor-v"),
    x0: document.getElementById("mru-x0"),
    x0Range: document.getElementById("mru-x0-range"),
    x0Output: document.getElementById("mru-x0-output"),
    x0Selector: document.getElementById("mru-x0-selector"),
    x0Less: document.getElementById("mru-x0-less"),
    x0More: document.getElementById("mru-x0-more"),
    v: document.getElementById("mru-v"),
    vRange: document.getElementById("mru-v-range"),
    vOutput: document.getElementById("mru-v-output"),
    vSelector: document.getElementById("mru-v-selector"),
    vLess: document.getElementById("mru-v-less"),
    vMore: document.getElementById("mru-v-more"),
    rastro: document.getElementById("mru-rastro"),
    ejes: document.getElementById("mru-ejes"),
    checkCronometro: document.getElementById("mru-check-cronometro"),
    btnPlay: document.getElementById("btn-play"),
    btnPausar: document.getElementById("btn-pausar"),
    btnSimular: document.getElementById("btn-simular"),
    btnPaso: document.getElementById("btn-paso"),
    hideBtnPaso: document.getElementById("hide-btn-paso"),
    btnReiniciar: document.getElementById("btn-reiniciar")
  };

  if (!elementos.canvas || !elementos.grafica) {
    console.error("No se encontraron los canvas necesarios para el simulador MRU.");
    return;
  }

  const ctx = elementos.canvas.getContext("2d");
  const graphCtx = elementos.grafica.getContext("2d");
  const mundo = { min: 0, max: 80 };
  const estado = {
    x0: 0,
    v: 10,
    t: 0,
    x: 0,
    ejecutando: false,
    ultimoTiempo: null,
    animacionId: null,
    rastro: []
  };

  // CODEX: añadido para restaurar el simulador completo desde los valores declarados en el HTML
  const valoresIniciales = {
    x0: numeroDesdeInput(elementos.x0Range, estado.x0),
    v: numeroDesdeInput(elementos.vRange, estado.v),
    rastro: elementos.rastro ? elementos.rastro.defaultChecked : true,
    ejes: elementos.ejes ? elementos.ejes.defaultChecked : true,
    cronometroVisible: elementos.checkCronometro ? elementos.checkCronometro.defaultChecked : true
  };
  // CODEX: añadido para que el cronometro visual funcione independiente de la simulacion MRU
  const cronometro = {
    t: 0,
    ejecutando: false,
    puedeReiniciar: false,
    ultimoTiempo: null,
    animacionId: null
  };
  const imagenes = {
    fondo: null,
    carro: null
  };
  const fondoCache = document.createElement("canvas");
  const fondoCacheCtx = fondoCache.getContext("2d");
  const fondoCacheEstado = {
    ancho: 0,
    alto: 0,
    dpr: 0,
    listo: false
  };

  // CODEX: añadido para leer URLs de assets declaradas como variables CSS y evitar duplicar rutas visuales
  function obtenerUrlCss(nombreVariable) {
    const valor = getComputedStyle(document.documentElement).getPropertyValue(nombreVariable).trim();
    const coincidencia = valor.match(/url\(["']?(.+?)["']?\)/);
    return coincidencia ? coincidencia[1] : "";
  }

  function cargarImagen(src) {
    return new Promise((resolve, reject) => {
      const imagen = new Image();
      imagen.onload = () => resolve(imagen);
      imagen.onerror = reject;
      imagen.src = src;
    });
  }

  // CODEX: modificado para pintar el tiempo propio del cronometro visual independiente del MRU
  function actualizarCronometroVisual(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosEnteros = Math.floor(segundos % 60);
    const centesimas = Math.floor((segundos % 1) * 100);

    if (elementos.cronoMin) {
      elementos.cronoMin.textContent = String(minutos).padStart(2, "0");
    }

    if (elementos.cronoSec) {
      elementos.cronoSec.textContent = String(segundosEnteros).padStart(2, "0");
    }

    if (elementos.cronoMs) {
      elementos.cronoMs.textContent = String(centesimas).padStart(2, "0");
    }
  }

  function numeroDesdeInput(input, respaldo) {
    const valor = Number.parseFloat(input.value);
    return Number.isFinite(valor) ? valor : respaldo;
  }

  // CODEX: añadido para mantener sincronizados inputs numericos y sliders del simulador
  // CODEX: añadido para sincronizar valor, output y selector del range personalizado de posicion inicial
  function obtenerPorcentajeRange(input) {
    const valor = Number(input.value);
    const minimo = Number(input.min);
    const maximo = Number(input.max);

    if (!Number.isFinite(valor) || !Number.isFinite(minimo) || !Number.isFinite(maximo) || maximo === minimo) {
      return 0;
    }

    return ((valor - minimo) / (maximo - minimo)) * 100;
  }

  // CODEX: modificado para reutilizar la misma logica en los deslizadores personalizados de x0 y velocidad
  function actualizarRangePersonalizado(configuracion) {
    const { range, input, output, selector, less, more, respaldo } = configuracion;

    if (!range) return respaldo;

    const valor = numeroDesdeInput(range, respaldo);
    const porcentaje = obtenerPorcentajeRange(range);

    if (input) {
      input.value = valor;
    }

    if (output) {
      output.textContent = valor.toFixed(0);
    }

    if (selector) {
      // CODEX: modificado para que la linea blanca central coincida con las tarjas del range
      selector.style.left = `${porcentaje}%`;
    }

    if (less) {
      less.disabled = valor <= Number(range.min);
    }

    if (more) {
      more.disabled = valor >= Number(range.max);
    }

    return valor;
  }

  function actualizarControlesPersonalizados() {
    estado.x0 = actualizarRangePersonalizado({
      range: elementos.x0Range,
      input: elementos.x0,
      output: elementos.x0Output,
      selector: elementos.x0Selector,
      less: elementos.x0Less,
      more: elementos.x0More,
      respaldo: estado.x0
    });

    estado.v = actualizarRangePersonalizado({
      range: elementos.vRange,
      input: elementos.v,
      output: elementos.vOutput,
      selector: elementos.vSelector,
      less: elementos.vLess,
      more: elementos.vMore,
      respaldo: estado.v
    });
  }

  function cambiarRangePersonalizado(range, respaldo, cambio, alCambiar) {
    const valorActual = numeroDesdeInput(range, respaldo);
    const valorMinimo = Number(range.min);
    const valorMaximo = Number(range.max);
    const nuevoValor = Math.min(Math.max(valorActual + cambio, valorMinimo), valorMaximo);

    range.value = nuevoValor;

    if (typeof alCambiar === "function") {
      alCambiar();
    }
  }

  // CODEX: modificado para separar lectura de controles y recalculo de posicion del carro
  function leerParametros(opciones = {}) {
    const { actualizarPosicion = true } = opciones;
    actualizarControlesPersonalizados();

    if (actualizarPosicion) {
      estado.x = estado.x0 + estado.v * estado.t;
    }

    elementos.x0Range.value = estado.x0;
    elementos.vRange.value = estado.v;
  }

  function actualizarDesdeX0() {
    leerParametros({ actualizarPosicion: false });
    estado.x = estado.x0;
    estado.rastro = [estado.x];
    dibujarTodo();
  }

  function actualizarDesdeVelocidad() {
    leerParametros({ actualizarPosicion: false });
    dibujarTodo();
  }

  function sincronizarDesde(origen, destino) {
    destino.value = origen.value;
    leerParametros();
    dibujarTodo();
  }

  function redimensionarCanvas(canvas, contexto) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const ancho = Math.max(1, Math.round(rect.width * dpr));
    const alto = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== ancho || canvas.height !== alto) {
      canvas.width = ancho;
      canvas.height = alto;
    }

    contexto.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dimensionesCanvas(canvas) {
    return {
      ancho: canvas.clientWidth,
      alto: canvas.clientHeight
    };
  }

  function xAPixel(x, ancho) {
    const margen = 0;
    return margen + ((x - mundo.min) / (mundo.max - mundo.min)) * (ancho - margen * 2);
  }

  function yEje(alto) {
    return alto * 0.81;
  }

  // CODEX: añadido para cachear el fondo estatico y evitar redibujarlo desde cero en cada frame
  function prepararFondoCache() {
    const { ancho, alto } = dimensionesCanvas(elementos.canvas);
    const dpr = window.devicePixelRatio || 1;

    if (
      fondoCacheEstado.listo &&
      fondoCacheEstado.ancho === ancho &&
      fondoCacheEstado.alto === alto &&
      fondoCacheEstado.dpr === dpr
    ) {
      return;
    }

    fondoCache.width = Math.max(1, Math.round(ancho * dpr));
    fondoCache.height = Math.max(1, Math.round(alto * dpr));
    fondoCacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fondoCacheCtx.clearRect(0, 0, ancho, alto);

    if (imagenes.fondo) {
      fondoCacheCtx.drawImage(imagenes.fondo, 0, 0, ancho, alto);
    } else {
      const degradado = fondoCacheCtx.createLinearGradient(0, 0, 0, alto);
      degradado.addColorStop(0, "#eff7ff");
      degradado.addColorStop(1, "#ffffff");
      fondoCacheCtx.fillStyle = degradado;
      fondoCacheCtx.fillRect(0, 0, ancho, alto);
    }

    fondoCacheEstado.ancho = ancho;
    fondoCacheEstado.alto = alto;
    fondoCacheEstado.dpr = dpr;
    fondoCacheEstado.listo = true;
  }

  function dibujarFondo(ancho, alto) {
    ctx.clearRect(0, 0, ancho, alto);
    ctx.drawImage(fondoCache, 0, 0, ancho, alto);
  }

  function dibujarEjeX(ancho, alto) {
    if (!elementos.ejes.checked) return;

    const y = yEje(alto);
    ctx.save();
    ctx.strokeStyle = "#030303";
    ctx.fillStyle = "#070707";
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(xAPixel(mundo.min, ancho), y);
    ctx.lineTo(xAPixel(mundo.max, ancho), y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xAPixel(mundo.max, ancho), y);
    ctx.lineTo(xAPixel(mundo.max, ancho) - 9, y - 5);
    ctx.lineTo(xAPixel(mundo.max, ancho) - 9, y + 5);
    ctx.closePath();
    ctx.fill();

    for (let marca = mundo.min + 10; marca <= mundo.max - 10; marca += 5) {
      const x = xAPixel(marca, ancho);
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(marca), x, y + 20);
    }

    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("x (m)", xAPixel(mundo.max, ancho), y + 20);
    ctx.restore();
  }

  function dibujarRastro(ancho, alto) {
    if (!elementos.rastro.checked || estado.rastro.length < 2) return;

    const y = yEje(alto) - 22;
    ctx.save();
    ctx.strokeStyle = "rgba(6, 70, 200, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    estado.rastro.forEach((punto, indice) => {
      const x = xAPixel(punto, ancho);
      if (indice === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }

  function dibujarVectorVelocidad(ancho, alto, xCarro) {
    if (Math.abs(estado.v) < 0.01) return;

    const y = yEje(alto) - 55;
    const direccion = estado.v >= 0 ? 1 : -1;
    const longitud = Math.min(84, Math.max(34, Math.abs(estado.v) * 2.4));
    const inicio = xCarro + direccion*1 - 25;
    const fin = inicio + direccion * longitud + 50;

    ctx.save();
    ctx.strokeStyle = "#0646c8";
    ctx.fillStyle = "#0646c8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(inicio, y);
    ctx.lineTo(fin, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(fin, y);
    ctx.lineTo(fin - direccion * 10, y - 6);
    ctx.lineTo(fin - direccion * 10, y + 6);
    ctx.closePath();
    ctx.fill();

    ctx.font = "13px system-ui, sans-serif";
    ctx.textAlign = direccion > 0 ? "left" : "right";
    ctx.fillText(`v = ${estado.v.toFixed(2)} m/s`, inicio, y - 12);
    ctx.restore();
  }

  function dibujarCarro(ancho, alto) {
    const x = xAPixel(estado.x, ancho);
    const y = yEje(alto) - 22;
    const anchoCarro = Math.max(52, Math.min(86, ancho * 0.11));
    const altoCarro = anchoCarro * 0.5;

    dibujarVectorVelocidad(ancho, alto, x);

    if (imagenes.carro) {
      ctx.drawImage(imagenes.carro, x - anchoCarro / 2, y - altoCarro / 2, anchoCarro, altoCarro);
      return;
    }

    ctx.save();
    ctx.fillStyle = "#1f73d8";
    ctx.fillRect(x - anchoCarro / 2, y - altoCarro / 2, anchoCarro, altoCarro);
    ctx.restore();
  }

  // CODEX: añadido para dibujar la grafica posicion-tiempo en tiempo real
  function dibujarGrafica() {
    const { ancho, alto } = dimensionesCanvas(elementos.grafica);
    graphCtx.clearRect(0, 0, ancho, alto);

    const margenIzq = 44;
    const margenDer = 16;
    const margenSup = 16;
    const margenInf = 34;
    const anchoUtil = ancho - margenIzq - margenDer;
    const altoUtil = alto - margenSup - margenInf;
    const tMax = Math.max(10, estado.t, 1);

    graphCtx.save();
    graphCtx.strokeStyle = "#dbe6f7";
    graphCtx.fillStyle = "#40527a";
    graphCtx.lineWidth = 1;
    graphCtx.font = "11px system-ui, sans-serif";

    graphCtx.beginPath();
    graphCtx.moveTo(margenIzq, margenSup);
    graphCtx.lineTo(margenIzq, margenSup + altoUtil);
    graphCtx.lineTo(margenIzq + anchoUtil, margenSup + altoUtil);
    graphCtx.stroke();

    for (let i = 0; i <= 4; i += 1) {
      const x = margenIzq + (anchoUtil * i) / 4;
      const y = margenSup + (altoUtil * i) / 4;
      graphCtx.strokeStyle = "#eef3fb";
      graphCtx.beginPath();
      graphCtx.moveTo(margenIzq, y);
      graphCtx.lineTo(margenIzq + anchoUtil, y);
      graphCtx.moveTo(x, margenSup);
      graphCtx.lineTo(x, margenSup + altoUtil);
      graphCtx.stroke();
    }

    graphCtx.fillText("x (m)", 8, margenSup + 8);
    graphCtx.fillText("t (s)", margenIzq + anchoUtil - 22, alto - 8);

    const puntos = estado.rastro.map((xValor, indice) => {
      const tValor = estado.rastro.length === 1 ? 0 : (estado.t * indice) / (estado.rastro.length - 1);
      return {
        x: margenIzq + (tValor / tMax) * anchoUtil,
        y: margenSup + altoUtil - ((xValor - mundo.min) / (mundo.max - mundo.min)) * altoUtil
      };
    });

    if (puntos.length > 1) {
      graphCtx.strokeStyle = "#0646c8";
      graphCtx.lineWidth = 2;
      graphCtx.beginPath();
      puntos.forEach((punto, indice) => {
        if (indice === 0) {
          graphCtx.moveTo(punto.x, punto.y);
        } else {
          graphCtx.lineTo(punto.x, punto.y);
        }
      });
      graphCtx.stroke();
    }

    graphCtx.restore();
  }

  function actualizarResultados() {
    elementos.valorT.textContent = `${estado.t.toFixed(2)} s`;
    elementos.valorX.textContent = `${estado.x.toFixed(2)} m`;
    elementos.valorV.textContent = `${estado.v.toFixed(2)} m/s`;
  }

  // CODEX: añadido para reflejar el estado del MRU en los botones visuales del cronometro
  // CODEX: modificado para que el boton de reinicio se habilite al iniciar y solo se deshabilite al reiniciar
  function actualizarBotonesCronometro() {
    if (elementos.cronoStart) {
      elementos.cronoStart.hidden = cronometro.ejecutando;
    }

    if (elementos.cronoStop) {
      elementos.cronoStop.hidden = !cronometro.ejecutando;
    }

    if (elementos.cronoRestart) {
      elementos.cronoRestart.hidden = !cronometro.puedeReiniciar;
    }

    if (elementos.cronoRestartDisabled) {
      elementos.cronoRestartDisabled.hidden = cronometro.puedeReiniciar;
    }
  }

  function pintarCronometro() {
    actualizarCronometroVisual(cronometro.t);
    actualizarBotonesCronometro();
  }

  function animarCronometro(timestamp) {
    if (!cronometro.ejecutando) return;

    if (cronometro.ultimoTiempo === null) {
      cronometro.ultimoTiempo = timestamp;
    }

    const delta = Math.min((timestamp - cronometro.ultimoTiempo) / 1000, 0.05);
    cronometro.ultimoTiempo = timestamp;
    cronometro.t += delta;
    pintarCronometro();
    cronometro.animacionId = requestAnimationFrame(animarCronometro);
  }

  function iniciarCronometro() {
    if (cronometro.ejecutando) return;

    cronometro.ejecutando = true;
    cronometro.puedeReiniciar = true;
    cronometro.ultimoTiempo = null;
    pintarCronometro();
    cronometro.animacionId = requestAnimationFrame(animarCronometro);
  }

  function pausarCronometro() {
    cronometro.ejecutando = false;
    cronometro.ultimoTiempo = null;

    if (cronometro.animacionId) {
      cancelAnimationFrame(cronometro.animacionId);
      cronometro.animacionId = null;
    }

    pintarCronometro();
  }

  function reiniciarCronometro() {
    pausarCronometro();
    cronometro.t = 0;
    cronometro.puedeReiniciar = false;
    pintarCronometro();
  }

  // CODEX: añadido para mostrar u ocultar el cronometro MRU desde el checkbox Cronometro
  function actualizarVisibilidadCronometro() {
    if (!elementos.cronometro || !elementos.checkCronometro) return;

    elementos.cronometro.hidden = !elementos.checkCronometro.checked;
  }

  function dibujarTodo() {
    redimensionarCanvas(elementos.canvas, ctx);
    redimensionarCanvas(elementos.grafica, graphCtx);
    prepararFondoCache();

    const { ancho, alto } = dimensionesCanvas(elementos.canvas);
    dibujarFondo(ancho, alto);
    dibujarEjeX(ancho, alto);
    dibujarRastro(ancho, alto);
    dibujarCarro(ancho, alto);
    dibujarGrafica();
    actualizarResultados();
  }

  // CODEX: añadido para habilitar el avance manual solo cuando la simulacion esta pausada
  function actualizarBotonPaso() {
    if (elementos.btnPaso) {
      elementos.btnPaso.style.display = estado.ejecutando ? "none" : "inline-block";
      elementos.btnPaso.disabled = estado.ejecutando;
    }

    if (elementos.hideBtnPaso) {
      elementos.hideBtnPaso.style.display = estado.ejecutando ? "inline-block" : "none";
      elementos.hideBtnPaso.disabled = true;
    }
  }

  function actualizarMovimiento(delta) {
    estado.t += delta;
    // CODEX: modificado para que cambiar velocidad en pausa no recalcule la posicion previa del carro
    estado.x += estado.v * delta;

    if (estado.rastro.length === 0 || Math.abs(estado.rastro[estado.rastro.length - 1] - estado.x) > 0.12) {
      estado.rastro.push(estado.x);
    }

    if (estado.rastro.length > 800) {
      estado.rastro.shift();
    }
  }

  function animar(timestamp) {
    if (!estado.ejecutando) return;

    if (estado.ultimoTiempo === null) {
      estado.ultimoTiempo = timestamp;
    }

    const delta = Math.min((timestamp - estado.ultimoTiempo) / 1000, 0.05);
    estado.ultimoTiempo = timestamp;
    const escalaTiempo = timeselect();
    actualizarMovimiento(delta * escalaTiempo);
    dibujarTodo();
    estado.animacionId = requestAnimationFrame(animar);
  }

  function iniciar() {
    leerParametros({ actualizarPosicion: false });
    if (estado.ejecutando) return;
    estado.ejecutando = true;
    estado.ultimoTiempo = null;
    actualizarBotonPaso();
    estado.animacionId = requestAnimationFrame(animar);
  }

  function pausar() {
    estado.ejecutando = false;
    estado.ultimoTiempo = null;
    if (estado.animacionId) {
      cancelAnimationFrame(estado.animacionId);
      estado.animacionId = null;
    }

    actualizarBotonPaso();
  }

  function avanzarUnPaso() {
    if (estado.ejecutando) return;

    leerParametros({ actualizarPosicion: false });
    actualizarMovimiento(0.01);
    dibujarTodo();
    actualizarBotonPaso();
  }

  // CODEX: añadido para normalizar los botones visuales cuando se reinicia el movimiento o el simulador completo
  function restaurarBotonesMovimiento() {
    if (elementos.btnPausar) {
      elementos.btnPausar.style.display = "none";
    }

    if (elementos.btnSimular) {
      elementos.btnSimular.style.display = "inline-block";
    }

    const btnPaso = document.getElementById("btn-paso");
    const hideBtnPaso = document.getElementById("hide-btn-paso");

    if (btnPaso) {
      btnPaso.style.display = "inline-block";
    }

    if (hideBtnPaso) {
      hideBtnPaso.style.display = "none";
    }
  }

  // CODEX: añadido para reiniciar solo el movimiento del carro con los parametros actuales
  function reiniciarMovimientoCarro() {
    pausar();
    leerParametros({ actualizarPosicion: false });
    estado.t = 0;
    estado.x = estado.x0;
    estado.rastro = [estado.x0];
    restaurarBotonesMovimiento();
    actualizarBotonPaso();
    dibujarTodo();
  }

  // CODEX: añadido para restaurar por completo el simulador MRU y sus controles visuales
  function reiniciarSimuladorCompleto() {
    pausar();
    reiniciarCronometro();

    elementos.x0Range.value = valoresIniciales.x0;
    elementos.vRange.value = valoresIniciales.v;

    if (elementos.rastro) {
      elementos.rastro.checked = valoresIniciales.rastro;
    }

    if (elementos.ejes) {
      elementos.ejes.checked = valoresIniciales.ejes;
    }

    if (elementos.checkCronometro) {
      elementos.checkCronometro.checked = valoresIniciales.cronometroVisible;
    }

    actualizarVisibilidadCronometro();
    leerParametros({ actualizarPosicion: false });
    estado.t = 0;
    estado.x = estado.x0;
    estado.rastro = [estado.x0];
    restaurarBotonesMovimiento();
    actualizarBotonPaso();
    dibujarTodo();
  }

  // CODEX: añadido para permitir arrastrar el cronometro MRU dentro del panel del canvas
  function limitarCronometroAlPanel() {
    if (!elementos.canvasPanel || !elementos.cronometro) return;

    const maxLeft = Math.max(0, elementos.canvasPanel.clientWidth - elementos.cronometro.offsetWidth);
    const maxTop = Math.max(0, elementos.canvasPanel.clientHeight - elementos.cronometro.offsetHeight);
    const left = Math.min(Math.max(elementos.cronometro.offsetLeft, 0), maxLeft);
    const top = Math.min(Math.max(elementos.cronometro.offsetTop, 0), maxTop);

    elementos.cronometro.style.left = `${left}px`;
    elementos.cronometro.style.top = `${top}px`;
  }

  // CODEX: modificado para proteger el selector de camara si los radios no estan disponibles
  const timeselect = () => {
    const Cslow = document.getElementById("Cslow");

    if (Cslow && Cslow.checked) {
      return 0.1;
    }

    return 1;
  };
  
  function habilitarArrastreCronometro() {
    if (!elementos.canvasPanel || !elementos.cronometro) return;

    elementos.cronometro.addEventListener("pointerdown", (evento) => {
      if (evento.target.closest("button")) return;

      evento.preventDefault();
      elementos.cronometro.setPointerCapture(evento.pointerId);

      const inicioX = evento.clientX;
      const inicioY = evento.clientY;
      const leftInicial = elementos.cronometro.offsetLeft;
      const topInicial = elementos.cronometro.offsetTop;

      const mover = (eventoMover) => {
        const panelRect = elementos.canvasPanel.getBoundingClientRect();
        const maxLeft = Math.max(0, panelRect.width - elementos.cronometro.offsetWidth);
        const maxTop = Math.max(0, panelRect.height - elementos.cronometro.offsetHeight);
        const siguienteLeft = leftInicial + eventoMover.clientX - inicioX;
        const siguienteTop = topInicial + eventoMover.clientY - inicioY;

        elementos.cronometro.style.left = `${Math.min(Math.max(siguienteLeft, 0), maxLeft)}px`;
        elementos.cronometro.style.top = `${Math.min(Math.max(siguienteTop, 0), maxTop)}px`;
      };

      const soltar = () => {
        elementos.cronometro.removeEventListener("pointermove", mover);
        elementos.cronometro.removeEventListener("pointerup", soltar);
        elementos.cronometro.removeEventListener("pointercancel", soltar);
      };

      elementos.cronometro.addEventListener("pointermove", mover);
      elementos.cronometro.addEventListener("pointerup", soltar);
      elementos.cronometro.addEventListener("pointercancel", soltar);
    });
  }

  // CODEX: añadido para conectar eventos de controles sin modificar la estructura visual existente
  function registrarEventos() {
    elementos.x0Range.addEventListener("input", actualizarDesdeX0);
    elementos.vRange.addEventListener("input", actualizarDesdeVelocidad);
    elementos.x0Less.addEventListener("click", () => cambiarRangePersonalizado(elementos.x0Range, estado.x0, -Number(elementos.x0Range.step || 1), actualizarDesdeX0));
    elementos.x0More.addEventListener("click", () => cambiarRangePersonalizado(elementos.x0Range, estado.x0, Number(elementos.x0Range.step || 1), actualizarDesdeX0));
    elementos.vLess.addEventListener("click", () => cambiarRangePersonalizado(elementos.vRange, estado.v, -Number(elementos.vRange.step || 1), actualizarDesdeVelocidad));
    elementos.vMore.addEventListener("click", () => cambiarRangePersonalizado(elementos.vRange, estado.v, Number(elementos.vRange.step || 1), actualizarDesdeVelocidad));
    elementos.rastro.addEventListener("change", dibujarTodo);
    elementos.ejes.addEventListener("change", dibujarTodo);
    elementos.checkCronometro.addEventListener("change", actualizarVisibilidadCronometro);
    elementos.btnPlay.addEventListener("click", reiniciarMovimientoCarro);
    elementos.btnSimular.addEventListener("click", iniciar);
    elementos.btnPausar.addEventListener("click", pausar);
    elementos.btnPaso.addEventListener("click", avanzarUnPaso);
    elementos.btnReiniciar.addEventListener("click", reiniciarSimuladorCompleto);

    if (elementos.cronoStart) {
      elementos.cronoStart.addEventListener("click", iniciarCronometro);
    }

    if (elementos.cronoStop) {
      elementos.cronoStop.addEventListener("click", pausarCronometro);
    }

    if (elementos.cronoRestart) {
      elementos.cronoRestart.addEventListener("click", reiniciarCronometro);
    }

    window.addEventListener("resize", () => {
      limitarCronometroAlPanel();
      dibujarTodo();
    });
  }

  async function iniciarSimulador() {
    try {
      const [fondo, carro] = await Promise.all([
        cargarImagen(obtenerUrlCss("--img-mru-fondo")),
        cargarImagen(obtenerUrlCss("--img-mru-carro"))
      ]);
      imagenes.fondo = fondo;
      imagenes.carro = carro;
    } catch (error) {
      console.error("No se pudieron cargar todas las imagenes del simulador MRU.", error);
    }

    registrarEventos();
    habilitarArrastreCronometro();
    reiniciarSimuladorCompleto();
  }

  iniciarSimulador();
  
})();

function hidebtnpausar() {
    document.getElementById('btn-pausar').style.display = 'none';
    document.getElementById('btn-simular').style.display = 'inline-block';
};

function hidebtnpaso() {
    document.getElementById('btn-paso').style.display = 'inline-block';
    document.getElementById('hide-btn-paso').style.display = 'none';
};

function btnpaso() {
    document.getElementById('btn-paso').style.display = 'none';
    document.getElementById('hide-btn-paso').style.display = 'inline-block';
};

function hidesimular() {
    document.getElementById('btn-pausar').style.display = 'inline-block';
    document.getElementById('btn-simular').style.display = 'none';
};

// Evento 6: Click en el boton ▌▌ del simulador en general
document.getElementById("btn-pausar").addEventListener("click", function () {
    hidebtnpausar();
    hidebtnpaso();
});

// Evento 7: Click en el boton ▶ del simulador en general
document.getElementById("btn-simular").addEventListener("click", function() {
    btnpaso();
    hidesimular();
});
