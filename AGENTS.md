# Instrucciones para agentes

Este repositorio es **Matemáticas Primaria** (título visible: *Aventuras Matemáticas*), una aplicación web en un único HTML (`Matematicas_Primaria.html`) con CSS en `css/` y JavaScript modular por tema en `js/`.

## Arquitectura

### Visión general

- **SPA sin build**: no hay `package.json`, bundler, framework ni dependencias externas. Todo es **HTML5 + CSS3 + JavaScript vanilla** y se ejecuta abriendo el HTML en el navegador (también publicado en GitHub Pages).
- **Una sola página con pestañas**: el HTML contiene todos los módulos como `<section id="tab-<modulo>" class="tab-panel">`; solo la que tiene la clase `active` se muestra (`css/base.css`).
- **Orden de carga importante**: primero `js/navegacion.js`, después `js/comun.js` (utilidades compartidas), luego `js/core.js` y a continuación cada módulo. Los módulos dependen de `window.MatesCore` y de `window.irA`, así que no deben cargarse antes.
- **Persistencia local**: todo el progreso e historial vive en `localStorage`. No hay backend ni envío de datos.

### `js/navegacion.js`

Gestiona el cambio de pestaña sin recargar:

- Expone `window.irA(id)` para activar `#tab-<id>`, actualizar la URL (`?modulo=<id>`) y subir al inicio.
- El botón `#btn-inicio` vuelve al panel inicial (`inicio`).
- Al cargar, restaura el módulo indicado en `?modulo=...`, por lo que cada juego tiene URL directa (p. ej. `?modulo=combinadas`).

### `js/comun.js` (utilidades compartidas)

Se carga antes que `core.js` y expone **`window.Comun`** (y `module.exports` para las pruebas en Node):

- `escaparHtml`, `separarMiles`/`separar`, `randInt`/`aleatorioInt`, `elegir`, `barajar`.
- `mulberry32`, `hashSemilla`, `leerSemilla`, `activarSemilla`, `semilla`.
- Al cargarse, si la URL lleva `?semilla=...`, sustituye `Math.random` por un generador `mulberry32` determinista. Sin ese parámetro no cambia nada.

### `js/core.js` (núcleo compartido)

Se ejecuta como IIFE y expone **`window.MatesCore`** con:

- `puntuar(mod, ok)` / `registrar(mod, ok, lineas, extra)`: suma puntos, racha, aciertos/errores, medallas, día y entrada de historial. `lineas` puede ser una cadena o un array de líneas. `extra` es opcional y acepta `{ tipo, enunciado, respuesta, correcta, tiempoMs, intento }`.
- `pintar()`: refresca cabecera de progreso y listado de logros del inicio.
- `pintarHistorial(mod)`: pinta la lista `<ul id="<prefijo>-listaHistorial">` de un módulo.
- `borrarHistorial(mod)`, `borrarTodo()`, `exportarHistorialJson()`, `exportarHistorialHtml()`, `importarHistorial(texto)`.
- Utilidades: `medallaNivel`, `MED_EMOJI`, `fechaHora`, `itemHistorial`.

Detalles internos relevantes:

- Clave de almacenamiento global: **`mates_v4_progreso`** (migra automáticamente desde `mates_v3_progreso` al arrancar).
- Estado: `{ puntos, racha, mejorRacha, aciertos, errores, mod: { <clave>: { a, e, ultimo, dias, hist, borrado } } }`.
- Claves de módulo usadas en el estado: `sy`, `tm`, `um`, `fr`, `de`, `re`, `nr`, `pa`, `md`, `dm`, `dv`, `mu`, `ap`, `pm`, `oc`, `pr`.
- Puntos: `10` base + hasta `+10` por racha + `+5` extra cada 5 aciertos seguidos. Medallas por módulo: 5 (bronce), 15 (plata), 40 (oro).
- Historial centralizado: cada respuesta se guarda en `mod.<clave>.hist` como `{ t, ok, l }` (marca de tiempo, acierto y líneas de texto), con hasta 1000 entradas por juego. Si el módulo aporta `extra`, la entrada incluye además `tipo`, `enunciado`, `respuesta`, `correcta`, `tiempoMs` e `intento`.
- Toasts (`#toast`) y confeti se gestionan aquí; los módulos solo llaman a `MatesCore`.
- El panel de inicio gestiona **Reiniciar puntos**, **Borrar todos los datos**, descarga de la copia completa (HTML/JSON) e importación desde JSON.

### Módulos de juego

Cada módulo es un fichero en `js/` que se ejecuta como **IIFE**, mantiene su estado en variables locales y solo expone en `window` lo que necesita el HTML (normalmente funciones invocadas desde `onclick` inline, con el prefijo del módulo).

| # | Juego | Pestaña | JS | CSS | Prefijo | Clave |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Sumas y restas | `tab-sumas` | `sumas.js` | `sumas.css` | `sy-` / `sy_` | `sy` |
| 2 | Tablas de multiplicar | `tab-tablas` | `tablas.js` | `tablas.css` | `tm-` / `tm_` | `tm` |
| 3 | Unidades métricas | `tab-unidades` | `unidades.js` | `unidades.css` | `um-` | `um` |
| 4 | Problemas | `tab-problemas` | `problemas.js` | `problemas.css` | `pr-` | `pr` |
| 5 | Fracciones | `tab-fracciones` | `fracciones.js` | `fracciones.css` | `fr-` | `fr` |
| 6 | Decimales y dinero | `tab-decimales` | `decimales.js` | `decimales.css` | `de-` | `de` |
| 7 | El reloj | `tab-reloj` | `reloj.js` | `reloj.css` | `re-` | `re` |
| 8 | Números romanos | `tab-romanos` | `romanos.js` | `reloj.css` | `nr-` | `nr` |
| 9 | Perímetro y área | `tab-figuras` | `figuras.js` | `reloj.css` | `pa-` | `pa` |
| 10 | Múltiplos y divisores | `tab-multiplos` | `multiplos.js` | `reloj.css` | `md-` | `md` |
| 11 | Descomponer números | `tab-descomponer` | `descomponer.js` | `descomponer.css` | `dm-` | `dm` |
| 12 | Divisiones | `tab-divisiones` | `divisiones.js` | `descomponer.css` | `dv-` | `dv` |
| 13 | Aproximaciones | `tab-aproximar` | `aproximaciones.js` | `descomponer.css` | `ap-` | `ap` |
| 14 | Multiplicaciones | `tab-multiplicaciones` | `multiplicaciones.js` | `multiplicaciones.css` | `mu-` | `mu` |
| 15 | Propiedades | `tab-propiedades` | `propiedades.js` | `propiedades.css` | `pm-` | `pm` |
| 16 | Operaciones combinadas | `tab-combinadas` | `combinadas.js` | `combinadas.css` | `oc-` | `oc` |

Algunos módulos mantienen un historial propio además del centralizado:

- **Problemas**: `localStorage` con clave `problemas_matematicas_primaria_historial_v2` (migra desde `..._v1`) y su panel desplegable propio.
- **Unidades**: historial de tandas en `metricHistory`, con exportación a **CSV** y borrado independiente.

### CSS

- `css/base.css`: base común (reset, fondo, `.tab-panel`, entradas de historial).
- `css/global.css`: estilos globales v3 (cabecera, panel de inicio, tarjetas, logros, toasts, confeti, responsive).
- Un CSS por bloque temático; varios juegos comparten fichero (`reloj.css`, `descomponer.css`).
- Sin preprocesadores ni variables CSS globales: estilos planos y clases con el prefijo del módulo.

## Convenciones de código

- JavaScript **vanilla**; se mezclan `var`/`let`/`const`, pero cada módulo queda encapsulado en una IIFE y no contamina el ámbito global.
- Los identificadores del DOM llevan el prefijo del módulo (`sy-operacion`, `oc-expresion`…). Las funciones expuestas al HTML usan `prefijo_funcion` (`sy_generarPregunta`, `tm_verificar`).
- Para no interferir entre juegos, el atajo **Enter** comprueba primero que la pestaña está activa, con un helper local del tipo `mostrarSumas()` que consulta `#tab-sumas.active`.
- Cada verificación llama a `MatesCore.registrar(<clave>, ok, lineas)`; si solo se puntúa sin detalle se usa `MatesCore.puntuar(<clave>, ok)`.
- Los historiales usan `<ul id="<prefijo>-listaHistorial">`; las clases de acierto/error son `<prefijo>-correcto` / `<prefijo>-incorrecto`, salvo `pm` y `oc` (`pm-ok`/`pm-ko`, `oc-ok`/`oc-ko`, definidas en `core.js`).
- El texto de la interfaz va en **español**, con lenguaje adaptado a 3.º–4.º de Primaria.
- Accesibilidad: usar `button` con `type="button"`, etiquetas `label` asociadas y `aria-live`/`aria-expanded` donde ya se hace.

## Añadir o modificar un módulo

1. Añade el `<section id="tab-<modulo>" class="tab-panel">` en `Matematicas_Primaria.html` y su tarjeta `data-ir="<modulo>"` en el panel de inicio.
2. Crea `js/<modulo>.js` como IIFE con prefijo propio y enlázalo al final del HTML, después de `core.js`.
3. Crea o reutiliza el CSS y enlázalo en el `<head>`.
4. Registra el módulo en `MODULOS` y `TAB` de `js/core.js` (nombre, emoji, pestaña y clave de estado).
5. Añade el contador y `<ul id="<prefijo>-listaHistorial">`; llama a `MatesCore.registrar(...)` al verificar.
6. Actualiza `README.md` (lista de juegos y estructura) y `CHANGELOG.md`.

## Comprobación de cambios

No hay proceso de build. Para validar:

- Abre `Matematicas_Primaria.html` en el navegador y prueba el módulo tocado.
- Comprueba navegación con `?modulo=...`, recarga (F5), puntos, racha, historial y exportación/importación.
- Revisa que no aparezcan errores en la consola del navegador y que el diseño siga siendo responsive.
- Con Node 20 o superior: `node --check js/*.js` y `node --test tests/*.test.js`. El flujo `.github/workflows/ci.yml` ejecuta ambas comprobaciones en cada push y pull request a `main`.

## Documentación del proyecto

- `README.md`: descripción, características, lista de los 16 juegos, estructura y tecnologías.
- `ROADMAP.md`: ideas y mejoras pendientes (destaca el chat de IA con prompts predefinidos).
- `CHANGELOG.md`: registro cronológico de cambios (reglas abajo).

## Actualizar el CHANGELOG

Cada cambio relevante en el proyecto debe quedar registrado en `CHANGELOG.md`.

### Reglas de agrupación

- Todas las entradas se agrupan **por día** bajo un encabezado de nivel 2 con el formato `## [AAAA-MM-DD]`.
- Las fechas se ordenan de la **más reciente a la más antigua** (la nueva entrada va arriba, justo después de la introducción del fichero).
- Si ya existe un encabezado con la fecha del día en curso, **no se crea otro**: se añaden las nuevas viñetas dentro de las secciones existentes de ese mismo día.
- Un día nunca aparece repetido en el fichero.

### Secciones dentro de cada día

Cada día puede contener una o varias de estas secciones de nivel 3, siempre en este orden:

1. `### Añadido` — funcionalidades, módulos, documentos o ficheros nuevos.
2. `### Cambiado` — modificaciones de comportamiento, interfaz, estilos o textos existentes.
3. `### Corregido` — errores de funcionamiento, cálculos, ortografía o maquetación.

No se incluyen secciones vacías: si un día no tiene cambios en una categoría, esa sección se omite.

### Estilo de las entradas

- Cada cambio es una viñeta que empieza con `- `.
- Se escriben en **español**, en pasado y de forma concisa (una línea por cambio).
- Los nombres de módulos, botones, vistas y documentos se destacan en **negrita** con `**...**` (por ejemplo: **problemas**, **Mostrar solución**, `ROADMAP.md`).
- No se usan viñetas anidadas ni líneas en blanco entre viñetas de la misma sección.
- Se deja una línea en blanco entre secciones y antes de cada nuevo encabezado de día.

### Estructura de referencia

```markdown
# Changelog

Todos los cambios relevantes de **Matemáticas Primaria**. Las entradas están ordenadas por fecha, de la más reciente a la más antigua.

## [2026-11-23]

### Añadido
- Documento `ROADMAP.md` con ideas de mejora para la aplicación.

### Cambiado
- Los botones de **Mostrar solución** ahora alternan a **Ocultar solución**.

### Corregido
- El módulo de **problemas** ya no revela el tipo de operaciones en la etiqueta.

## [2026-11-22]

### Añadido
- Descarga del historial de respuestas en formato **HTML** y **JSON**.
```

### Al registrar un cambio

1. Obtén la fecha actual en formato `AAAA-MM-DD`.
2. Si esa fecha ya existe en `CHANGELOG.md`, añade las viñetas en sus secciones; si no existe, crea el bloque completo y colócalo como el más reciente.
3. Elige la sección según el tipo de cambio (`Añadido`, `Cambiado` o `Corregido`).
4. Revisa que el orden de fechas, el orden de secciones y la ortografía sigan siendo correctos.
