# Aplicaciones React de Physikós

Esta carpeta funciona como workspace npm para las aplicaciones educativas y su
biblioteca visual compartida.

## Paquetes

- `simulator-ui`: componentes, tipos y estilos comunes.
- `simulador-mruv`: laboratorio de MRUV en pista neumática.
- `simulador-caida-libre`: laboratorio de caída libre.
- `simulador-movimiento-parabolico`: laboratorio de lanzamiento parabólico en
  construcción.

## Instalación del workspace

Desde esta carpeta se ejecuta una sola instalación para enlazar la biblioteca
local con ambos simuladores:

```powershell
npm.cmd install
```

Después se puede iniciar cada aplicación con `npm.cmd run dev:mruv`,
`npm.cmd run dev:caida-libre` o `npm.cmd run dev:movimiento-parabolico`. Los
bundles integrados continúan siendo tareas separadas para que cada simulador se
publique de manera independiente.
