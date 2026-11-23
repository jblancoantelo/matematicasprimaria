# Changelog

Todos los cambios relevantes de **Matemáticas Primaria**. Las entradas están ordenadas por fecha, de la más reciente a la más antigua.

## [2026-11-23]

### Añadido
- Documento `ROADMAP.md` con ideas de mejora para la aplicación, incluyendo un chat de IA.

### Cambiado
- Los botones de **Mostrar solución** y **Mostrar cómo se resuelve** del módulo de problemas ahora alternan su texto a **Ocultar solución** y **Ocultar ayuda**, eliminando el botón de ocultar independiente.

### Corregido
- El módulo de **problemas** ya no revela el tipo de operaciones que hay que realizar en la etiqueta del problema.
- El panel **Datos y operaciones** del módulo de problemas ahora se muestra y se oculta correctamente con el botón de ayuda.
- Corregida la ortografía del contador de operaciones (`2 operaciones`).

## [2026-11-22]

### Añadido
- Descarga del historial de respuestas en formato **HTML** y **JSON**.
- Importación del historial desde un fichero **JSON**.
- Fecha y hora destacadas en los historiales, con cada entrada separada como lista.

### Cambiado
- El historial de respuestas se centraliza y se comparte entre las vistas de **progreso** y **medallas**.
- El historial ya no tiene límite de entradas y sus elementos se alinean a la izquierda.
- El desplegable de descarga del historial se abre hacia arriba.

### Corregido
- El botón **Ir al juego** ahora usa los identificadores de pestaña correctos.

## [2026-11-21]

### Añadido
- Fecha y hora de la última partida en las vistas de **progreso** y **medallas**.

### Cambiado
- El progreso por fechas es ahora un desplegable y la medalla se muestra más grande.
- Se elimina la nota explicativa del progreso y el bloque **Mi Panel**, cuyos tooltips se mueven a los datos de la cabecera.
- Se reduce el espacio entre la cabecera y el inicio de la pantalla principal.

## [2026-11-14]

### Añadido
- Módulo de **operaciones combinadas**, con contador de 1 a 99 y selector de operaciones con o sin paréntesis.

## [2026-10-29]

### Cambiado
- Nuevo selector de cifras y límite del divisor en **divisiones**.
- Alineación de las cajas de divisiones.

## [2026-10-26]

### Añadido
- Comprobación de la propiedad distributiva resolviendo el paréntesis.
- Fecha y hora en los historiales de **Propiedades**.
- Pasos guiados en el módulo de **Propiedades**.

### Cambiado
- El alumno elige la operación (`×` o `+`) en la propiedad distributiva.
- La distributiva se restringe a la forma `a × (b + c)`.

## [2026-10-23]

### Añadido
- Módulo de **propiedades** de la multiplicación: conmutativa, asociativa y distributiva.

## [2026-10-11]

### Añadido
- Documentación del acceso a la aplicación mediante **GitHub Pages**.
- Documentación de las funciones principales.
- Commit inicial del proyecto: aplicación web de matemáticas de Primaria en un único HTML con CSS y JavaScript modular por temas (sumas, restas, multiplicaciones, divisiones, fracciones, decimales, problemas, reloj, tablas, unidades, figuras, romanos, múltiplos, aproximaciones y descomposición).
- Mejoras de presentación en **divisiones** y **multiplicaciones**.
- Mejoras en la navegación de **multiplicaciones**.
- Mejoras en los controles y estilos de **multiplicaciones**.
