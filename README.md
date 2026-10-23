# 🧮 Aventuras Matemáticas

## 🔗 Abrir la aplicación

👉 **[Abrir Aventuras Matemáticas en el navegador](https://jblancoantelo.github.io/matematicasprimaria/Matematicas_Primaria.html)**

Haz clic en el enlace anterior para jugar directamente, sin descargar ni instalar nada.

> Si el enlace aún no funciona, activa **GitHub Pages** siguiendo estos pasos:
> 1. Entra en el repositorio: https://github.com/jblancoantelo/matematicasprimaria
> 2. Ve a **Settings → Pages**.
> 3. En **Source**, selecciona la rama **`main`** y la carpeta **`/ (root)`**, y pulsa **Save**.
> 4. Espera 1–2 minutos y vuelve a abrir el enlace de arriba.

---

Aplicación web interactiva para practicar **matemáticas de Primaria**. Funciona directamente en el navegador (sin servidor ni instalación) y guarda el progreso del alumno en el propio dispositivo.

Está pensada para alumnado de **3º y 4º de Primaria**, con 15 juegos organizados por bloques temáticos, apoyo visual, corrección automática y un sistema de puntos, rachas y medallas para motivar la práctica diaria.

---

## ✨ Características generales

- **Panel de inicio** con resumen del progreso: puntos, racha, medallas y aciertos totales.
- **Sistema de puntos**: cada acierto suma `10` puntos base, con bonus creciente según la racha (hasta +10 extra) y `+5` extra cada 5 aciertos seguidos.
- **Racha**: cuenta de aciertos consecutivos. Si se falla, vuelve a cero. Se guarda la mejor racha histórica.
- **Medallas por juego**: 🥉 5 aciertos · 🥈 15 aciertos · 🥇 40 aciertos.
- **Logros por módulo**: lista con los aciertos y errores de cada juego y su medalla actual.
- **Corrección automática** de las respuestas con mensajes de éxito o error.
- **Historial de respuestas** en la mayoría de los juegos.
- **Confeti** al acertar y **avisos emergentes** (toast) al alcanzar hitos de racha.
- **Navegación por pestañas** (SPA) sin recargar la página, con el módulo activo guardado en la URL (`?modulo=...`) para conservarlo al refrescar.
- **Atajo de teclado**: pulsa **Enter** para verificar la respuesta en la mayoría de los juegos (sumas, tablas, fracciones, decimales, romanos, perímetro, multiplicaciones, divisiones, descomponer, aproximaciones y propiedades).
- **Avance automático**: en algunos juegos (sumas, divisiones, aproximaciones, multiplicaciones, descomponer y propiedades) la pregunta cambia sola después de comprobar la respuesta.
- **Reinicio de progreso**: botón **🗑️ Reiniciar puntos** en *Mi Panel* para borrar puntos, racha y medallas (pide confirmación).
- **Persistencia local** con `localStorage` (puntos, medallas, historiales). Nada se envía a internet.
- **Diseño responsive**, adaptado a ordenador, tablet y móvil.

---

## 🎮 Los 15 juegos

### 1. 🧮 Sumas y Restas
Operaciones verticales (en columna).
- Elige suma o resta.
- Tanto en sumas como en restas puedes elegir cuántos números (de 2 a 5).
- Configura las cifras enteras (de 1 a 6) y los **decimales** (de 0 a 3) de cada número.
- Contador de aciertos/errores e historial de respuestas.

### 2. ✖️ Tablas de Multiplicar
- Tablas del 0 al 10, modo **aleatorio** y **aleatorio difícil** (hasta el 12, sin 0, 1 ni 10).
- **Modo contrarreloj**: elige los segundos (5–300) y resuelve tantas como puedas antes de que acabe el tiempo.
- Contador de aciertos/errores e historial.

### 3. 📏 Unidades Métricas
Conversión de medidas con escalera visual de unidades.
- Tipos: **longitud**, **masa**, **capacidad** y **tiempo**.
- Elige cuántos ejercicios (1–50) y el **salto máximo** entre unidades.
- Opción de **incluir decimales**.
- Botón de **pista** con explicación y escalera.
- **Exportar historial a CSV** y borrar historial. Historial guardado solo en el navegador.

### 4. 🍕 Fracciones
Con apoyo visual (figuras divididas).
- Identificar la fracción coloreada.
- Suma y resta con el mismo denominador.
- Comparar fracciones (`>`, `<`, `=`) escribiendo el símbolo.

### 5. 💰 Decimales y dinero
- Leer la cuadrícula de centésimas.
- Convertir entre céntimos y euros.
- Suma de decimales.
- Cálculo de la devolución (cambio) con euros.

### 6. 🕐 El Reloj
Reloj de agujas dibujado.
- Leer la hora que marca el reloj.
- Calcular qué hora será dentro de un rato.

### 7. 🏛️ Números Romanos
- Convertir de número normal a romano.
- Convertir de romano a número normal.
- Números del 1 al 399.

### 8. 📐 Perímetro y Área
Figuras de rectángulos y cuadrados.
- Calcular el perímetro.
- Calcular el área.

### 9. 🔢 Múltiplos y Divisores
- Mínimo común múltiplo (m.c.m.).
- Máximo común divisor (m.c.d.).
- ¿Es divisor? (comprobación de divisibilidad).

### 10. 🤔 Problemas
Generador de problemas de la vida real (dinero, colegio, juguetes, comida o mezclado).
- Nivel **3º (repaso)** o **4º de Primaria**.
- De **1 a 5 operaciones** encadenadas en 4º (hasta 4 en 3º): suma, resta, multiplicación y división.
- Botones para **mostrar la solución** y **mostrar cómo se resuelve**, separando **Datos** y **Operaciones**.
- Historial desplegable que marca en rojo los problemas fallados, con opciones de abrir/cerrar todo y borrar.

### 11. 🧩 Descomponer Números
- Escribe el valor de cada cifra (U, D, C, UM, DM, CM…).
- Números desde 3 hasta 12 cifras.

### 12. ➗ Divisiones
- Cuenta de dividir en columna con cajitas para cociente y resto.
- Configura las cifras del dividendo (2–6) y del divisor (1–3).
- Comprobación por pasos.

### 13. ✖️ Multiplicaciones
- Multiplicación en columna como en papel: una fila de casillas por cada producto parcial y suma final.
- Configura cifras enteras y **decimales** de ambos factores.

### 14. 🎯 Aproximaciones
Redondeo de números enteros.
- Números de 3 a 6 cifras.
- Redondear a la unidad, decena, centena, unidad de millar, decena de millar o centena de millar.

### 15. 🔁 Propiedades de la Multiplicación
Completa igualdades para practicar las tres propiedades.
- **Conmutativa**: cambiar el orden de los factores no cambia el producto.
- **Asociativa**: cambiar la agrupación de tres factores no cambia el producto.
- **Distributiva**: multiplicar por una suma o resta equivale a multiplicar por cada término y luego sumar o restar.
- Modo **mezcla** con las tres propiedades, botón de **pista** y explicación tras cada respuesta.
- Contador de aciertos y errores, historial y avance automático al acertar.

---

## 📁 Estructura del proyecto

```
mates/
├── Matematicas_Primaria.html   # Página principal (estructura y módulos)
├── css/
│   ├── base.css                # Estilos base
│   ├── global.css              # Estilos globales v3 (panel, cabecera, logros)
│   ├── sumas.css               # Sumas y restas
│   ├── tablas.css              # Tablas de multiplicar
│   ├── unidades.css            # Unidades métricas
│   ├── problemas.css           # Problemas
│   ├── fracciones.css          # Fracciones
│   ├── decimales.css           # Decimales y dinero
│   ├── reloj.css               # Reloj, romanos, perímetro, múltiplos
│   ├── descomponer.css         # Descomponer, divisiones, aproximaciones
│   ├── multiplicaciones.css    # Multiplicaciones
│   └── propiedades.css         # Propiedades de la multiplicación
└── js/
    ├── navegacion.js           # Cambio de pestañas y URL
    ├── core.js                 # Puntos, racha, medallas, logros, confeti, toast
    ├── sumas.js                # Módulo 1
    ├── tablas.js               # Módulo 2
    ├── unidades.js             # Módulo 3
    ├── problemas.js            # Módulo 4
    ├── fracciones.js           # Módulo 5
    ├── decimales.js            # Módulo 6
    ├── reloj.js                # Módulo 7
    ├── romanos.js              # Módulo 8
    ├── figuras.js              # Módulo 9
    ├── multiplos.js            # Módulo 10
    ├── descomponer.js          # Módulo 11
    ├── divisiones.js           # Módulo 12
    ├── aproximaciones.js       # Módulo 13
    ├── multiplicaciones.js     # Módulo 14
    └── propiedades.js          # Módulo 15
```

---

## 🚀 Cómo usar

1. Descarga o clona el repositorio.
2. Abre el archivo `Matematicas_Primaria.html` en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
3. En el panel **🏠 Mi Panel**, elige un juego, resuelve los ejercicios y gana puntos y medallas.

> No requiere instalación, servidor ni conexión a internet. Todo el progreso se guarda localmente en el navegador del dispositivo.

---

## 🛠️ Tecnologías

- **HTML5** (una sola página con secciones/pestañas).
- **CSS3** modular (un archivo por bloque temático).
- **JavaScript** vanilla (sin frameworks ni dependencias externas).
- **localStorage** para la persistencia del progreso.
