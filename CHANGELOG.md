# Changelog

Todos los cambios relevantes de **Matemáticas Primaria**. Las entradas están ordenadas por fecha, de la más reciente a la más antigua.

## [2026-11-26]

### Añadido
- `:focus-visible` global para navegar con teclado por botones, enlaces, campos, casillas y resúmenes de detalle.
- `aria-label` en las casillas generadas de **sumas**, **descomponer**, **divisiones**, **multiplicaciones**, **propiedades** y **combinadas**, y en el campo de segundos del contrarreloj de **tablas**.

### Cambiado
- Se retiró del `ROADMAP.md` la lista de fallos ya corregidos para dejar solo las propuestas pendientes.
- Las columnas de **divisiones** y **multiplicaciones** se pueden desplazar en horizontal en pantallas estrechas.

### Corregido
- El atajo **Enter** respeta el foco de botones, desplegables, áreas de texto y enlaces en **sumas**, **fracciones**, **decimales**, **romanos**, **figuras**, **propiedades** y **combinadas**.

## [2026-11-25]

### Añadido
- Ciclo de vida único por pregunta: cada respuesta se puntúa una sola vez y los temporizadores de autoavance se cancelan al generar, al comprobar y al cambiar de pestaña.
- Aviso cuando el navegador no puede guardar el progreso por falta de espacio.
- Botón **Ver más** en los historiales, que carga las respuestas antiguas de 50 en 50.
- Nuevo modo **¿Cuántos minutos faltan?** en el módulo de **reloj**, con opciones numéricas.
- 60 marcas de minutos en el reloj de agujas para leer las horas con precisión.
- Confirmación antes de generar una nueva tanda en **unidades** si ya hay respuestas escritas.

### Cambiado
- El historial central guarda como máximo 1000 respuestas por juego y pinta solo las 50 más recientes.
- El reinicio de puntos recarga la página para que los contadores locales de cada juego queden a cero.
- El historial propio de **problemas** guarda hasta 100 problemas y solo al responder o pedir ayuda.
- El contrarreloj de **tablas** ya no borra el historial ni reinicia los contadores acumulados.
- En **fracciones**, la comparación admite el símbolo «=» con fracciones equivalentes y la segunda fracción de la resta se muestra en rojo.
- En **propiedades**, el ejercicio de distributiva exige colocar los paréntesis en cada producto.
- El campo de respuesta de **problemas** acepta coma decimal y avisa si el valor no es un número.
- En **unidades**, cada tanda guarda el tipo y los ajustes usados al generarla y el historial se actualiza en lugar de duplicarse.
- Al importar un historial se recalculan los aciertos, los errores y las medallas de cada juego.

### Corregido
- Ya no se pueden sumar puntos repitiendo la comprobación en **sumas**, **tablas**, **fracciones**, **decimales**, **romanos**, **figuras**, **reloj**, **múltiplos**, **aproximaciones**, **descomponer**, **divisiones**, **multiplicaciones**, **combinadas** y **unidades**.
- El autoavance de **sumas**, **tablas**, **descomponer**, **aproximaciones**, **divisiones** y **multiplicaciones** ya no borra la pregunta que se está escribiendo.
- El contrarreloj de **tablas** no admite respuestas una vez agotado el tiempo.
- Cambiar el tipo de unidad regenera los ejercicios y no mezcla unidades ni ajustes.
- El historial de **unidades** escapa el texto del alumno y ya no inserta HTML.
- Los ejercicios de **unidades** sin responder ya no cuentan como error.
- El resto de las divisiones y la suma final de las multiplicaciones se leen por valor posicional, sin aceptar cifras descolocadas.
- Los problemas de **libros**, **ahorro familiar**, **cromos**, **gastos**, **kiosco**, **melones** y **juegos** ya no dan resultados negativos ni importes irreales.
- La devolución del **kiosco** se calcula con billetes reales.

## [2026-11-24]

### Añadido
- Nueva sección **10. Revisión completa de la aplicación** en `ROADMAP.md`, con los fallos detectados, las funcionalidades para 4.º de Primaria, las mejoras técnicas y un plan por fases.

## [2026-11-23]

### Añadido
- Documento `ROADMAP.md` con ideas de mejora para la aplicación, incluyendo un chat de IA.

### Cambiado
- Los botones de **Mostrar solución** y **Mostrar cómo se resuelve** del módulo de problemas ahora alternan su texto a **Ocultar solución** y **Ocultar ayuda**, eliminando el botón de ocultar independiente.
- Añadido en el `README.md` un enlace al **CHANGELOG.md**.
- El `AGENTS.md` ahora documenta la arquitectura, los módulos, las convenciones de código y el proceso para añadir un juego.

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
