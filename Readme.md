# Physikós

## Filosofía del Proyecto

**Physikós** es una plataforma educativa desarrollada para compartir de manera gratuita recursos de aprendizaje en Matemáticas y Física.

Su objetivo principal es integrar en un solo lugar:

* Videos de clase.
* Planes de clase.
* Simuladores interactivos.
* Graficadores.
* Formularios de evaluación.
* Repositorio de libros.
* Material de apoyo.

El proyecto prioriza la claridad, el rendimiento y la facilidad de mantenimiento antes que el uso de tecnologías de moda.

---

# Principios del Proyecto

## 1. Mantener la simplicidad

El proyecto utiliza únicamente:

* HTML5
* CSS3
* JavaScript (Vanilla JS)

No se utilizan frameworks para el desarrollo de la interfaz.

---

## 2. La arquitectura es modular

Cada nueva funcionalidad debe desarrollarse como un módulo independiente.

Ejemplo:

```
script/
    simuladores/
    evaluaciones/
    repositorio_planes/
```

Evitar archivos JavaScript con múltiples responsabilidades.

---

## 3. Separación de responsabilidades

Siempre que sea posible separar:

* Datos
* Interfaz
* Eventos
* Estado
* Renderizado

Ejemplo para evaluaciones:

```
script/
    evaluaciones/
        preguntas.js
        quiz.js
        timer.js
        feedback.js
```

---

## 4. No duplicar código

Antes de crear una nueva función verificar si ya existe una implementación similar.

Si una funcionalidad puede reutilizarse, debe convertirse en un componente común.

---

## 5. Los datos no deben mezclarse con la lógica

Los bancos de preguntas, listas de libros, videos o recursos deben almacenarse en archivos de datos independientes.

Ejemplo:

```
preguntas_3BGU.js
libros_fisica.js
mecanica_newtoniana_data.js
```

---

## 6. CSS organizado

Los estilos nuevos deben colocarse en archivos específicos según su funcionalidad.

Ejemplo:

```
styles/

evaluaciones.css
simuladores.css
repositorio_libros.css
```

Evitar que un solo archivo CSS crezca indefinidamente.

---

## 7. Convención para nombres

Para archivos nuevos utilizar:

* minúsculas
* sin espacios
* sin tildes
* guion bajo (_)

Ejemplos:

```
pendulo_simple.html
series_de_balmer.html
preguntas_3bgu.js
```

---

## 8. No modificar la arquitectura sin justificación

Antes de reorganizar carpetas o renombrar archivos existentes, evaluar el impacto sobre el resto del proyecto.

Las mejoras deben ser progresivas.

---

## 9. Prioridad del proyecto

La prioridad siempre será mejorar la experiencia educativa del estudiante.

Las decisiones técnicas deben apoyar este objetivo.

---

# Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript (Vanilla)
* KaTeX
* PDF.js
* jQuery (solo donde ya exista integración)

---

# Frameworks

Actualmente NO se utilizan:

* React
* Angular
* Vue
* Bootstrap
* Tailwind CSS

Antes de incorporar cualquier framework debe justificarse su necesidad.

---

# Organización general

```
contenido/
styles/
script/
img/
visor_pdfs/
```

Cada carpeta tiene una responsabilidad específica y debe mantenerse organizada.

---

# Cómo agregar una nueva sección

1. Crear la página HTML correspondiente.
2. Crear el CSS específico si es necesario.
3. Crear la carpeta JavaScript del módulo.
4. Mantener la separación entre datos y lógica.
5. Reutilizar componentes existentes cuando sea posible.

---

# Objetivo a largo plazo

Construir una plataforma educativa abierta, organizada y sostenible, que pueda seguir creciendo durante muchos años sin perder claridad ni facilidad de mantenimiento.

## Regla para cambios asistidos por IA

Cuando Codex u otra IA modifique el proyecto, debe comentar los bloques agregados o modificados.

Formato:

HTML:
`<!-- CODEX: añadido para describir la función -->`

CSS:
`/* CODEX: añadido para describir la función */`

JavaScript:
`// CODEX: añadido para describir la función`

Los comentarios deben ser breves y funcionales. No deben colocarse en cada línea, solo en bloques relevantes.

## Versiones
2023-04-25: http://charnando.surge.sh/
