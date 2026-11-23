# Instrucciones para agentes

Este repositorio es **Matemáticas Primaria**, una aplicación web en un único HTML (`Matematicas_Primaria.html`) con CSS en `css/` y JavaScript modular por tema en `js/`.

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
