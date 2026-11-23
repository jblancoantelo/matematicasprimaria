# 🗺️ Roadmap — Aventuras Matemáticas

Ideas, mejoras y trabajo pendiente para la aplicación. No es una lista cerrada: se puede ampliar, reordenar y recortar.

**Leyenda**

| Símbolo | Significado |
| --- | --- |
| 💡 | Idea / propuesta |
| 🔜 | Siguiente en la lista |
| 🚧 | En desarrollo |
| ✅ | Hecho |
| ⏸️ | En pausa |
| ❌ | Descartado (con motivo) |

**Prioridad:** 🔥 alta · ⭐ media · 💭 baja
**Esfuerzo:** S (horas) · M (días) · L (semanas)

---

## 1. 💡 Ideas

### 1.1 🤖 Chat de IA con prompts predefinidos 🔥 · L

Añadir un **asistente educativo** dentro de cada juego para acompañar al alumno cuando se atasca, sin sustituir el esfuerzo de resolver el ejercicio.

#### Qué queremos

Un **chat** integrado en la interfaz (panel lateral en escritorio, hoja desplegable en móvil) que:

- Conoce **el ejercicio actual**: enunciado, tipo de operación, respuestas que ha probado el alumno, respuesta correcta e historial reciente.
- Arranca con **prompts predefinidos** en forma de botones, para que el niño o la niña no tenga que escribir nada si no quiere.
- Permite después **preguntas libres** en lenguaje natural.
- Responde con **lenguaje de 3º–4º de Primaria**: frases cortas, pasos numerados, ejemplos con objetos cotidianos.
- **No da la solución de golpe**: primero pistas, y solo si el alumno insiste o lo pide explícitamente.

#### Prompts predefinidos (primera versión)

| Botón | Qué debe hacer |
| --- | --- |
| 🪜 **Explícame cómo resolverlo** | Guía paso a paso **con pistas**, sin revelar el resultado final. Termina preguntando «¿qué crees que va ahora?». |
| 🔍 **Dame más detalles** | Amplía la explicación anterior: por qué se hace cada paso, qué regla se aplica, un ejemplo parecido resuelto. |
| ❌ **¿En qué he fallado?** | Compara la respuesta del alumno con la correcta e identifica el **error concreto** (se ha equivocado de operación, no ha alineado las cifras, ha olvidado los decimales, ha redondeado mal…). Sin regañar. |
| 🧠 **¿Por qué esta es la respuesta correcta?** | Justifica la solución correcta y comprueba el resultado por otro camino. |
| 🧸 **Explícamelo como si tuviera 9 años** | Reformula con un ejemplo cotidiano (cromos, chuches, dinero, cajas). |
| 🎯 **Ponme otro ejemplo parecido** | Genera un ejercicio del mismo tipo, pero **no lo corrige**: deja que lo resuelva el alumno. |
| ✏️ **Dame una pista, no la solución** | Pista mínima, la más pequeña que desbloquee el siguiente paso. |
| 🔁 **Resúmeme la regla** | Devuelve la regla matemática en una frase y un ejemplo corto. |

Los botones se adaptan al módulo activo: en *Fracciones* aparece «dibújame la fracción», en *Operaciones combinadas* «¿qué operación va primero?», en *Unidades* «enséñame la escalera», etc.

#### Dónde vive

- Un botón flotante **🤖 ¿Te ayudo?** visible en todos los juegos.
- Al pulsarlo se abre el chat con el contexto del ejercicio **ya cargado** (sin que el alumno tenga que explicarlo).
- Al cambiar de ejercicio, el chat se reinicia o se conserva por sesión (a decidir), pero siempre con una nota de qué ejercicio se está comentando.

#### Qué información se envía al modelo

Contexto mínimo, nunca datos personales:

```json
{
  "modulo": "divisiones",
  "nivel": "4º Primaria",
  "ejercicio": "845 ÷ 6",
  "intentos": [
    { "respuesta": "140 r 5", "correcta": false },
    { "respuesta": "141", "correcta": false }
  ],
  "respuesta_correcta": "140 r 5"
}
```

Reglas:

- **Nunca** se envía el nombre del alumno, su centro, su edad exacta ni el historial completo de otros juegos.
- El historial enviado se limita a los **últimos N intentos del ejercicio activo**.
- Si el alumno escribe libremente, se filtran datos personales evidentes antes de enviar.

#### Cómo implementarlo (opciones)

| Opción | Ventajas | Inconvenientes |
| --- | --- | --- |
| **A. Proxy propio (serverless)** — el navegador llama a un pequeño endpoint que guarda la clave y llama al modelo | Clave protegida, control de coste, filtros y registro centralizado | Requiere alojamiento (Cloudflare Workers, Vercel, Deno Deploy…); ya no es 100 % estático |
| **B. Clave en el navegador** — llamada directa a la API del proveedor | Cero infraestructura | **Clave expuesta**: cualquiera puede usarla y generar coste. Solo aceptable en un fork privado de pruebas |
| **C. Modelo en el dispositivo** (WebLLM / transformers.js) | Privado, offline, sin coste por uso | Descarga grande, lento en equipos modestos, calidad inferior |
| **D. Modo híbrido** (recomendado) | Si no hay red o no hay IA disponible, se usan **explicaciones deterministas** ya escritas para cada tipo de ejercicio | Más trabajo de contenido |

**Recomendación:** A para producción + D como red de seguridad. La app sigue funcionando sin IA, como ahora.

#### Seguridad y pedagogía

- **Prompt de sistema** fijo, en español, con el rol de «maestro de Primaria paciente», tono positivo y prohibición de dar la solución completa salvo petición explícita.
- **Filtro de contenido** y límite de longitud de respuesta (para que quepa en pantalla y no abrume).
- **Límite de mensajes** por sesión y por día (por ejemplo 20) para controlar coste y evitar dependencia.
- **Modo familias/docentes**: interruptor para activar o desactivar la IA, y un pequeño resumen de uso.
- **Aviso claro**: «La IA puede equivocarse. Comprueba siempre con tu profe».
- Registrar el **coste estimado** por sesión durante las pruebas.

#### Fases

1. **Prototipo interno** — chat solo en *Sumas y Restas* y *Divisiones*, con prompts predefinidos y contexto fijo. Sin backend, con clave de pruebas. ✅ validar que las respuestas son útiles.
2. **Diseño del prompt de sistema** — iterar con ejercicios reales de 3º y 4º, midiendo cuántas veces da la solución antes de tiempo. Guardar los prompts en un archivo versionado (`js/ia/prompts.js`).
3. **Backend proxy** — endpoint con la clave, límites de uso y caché de respuestas frecuentes (mismo enunciado + mismo error → misma explicación).
4. **Despliegue en los 16 juegos** — contexto por módulo y prompts específicos.
5. **Fallback sin IA** — explicaciones estáticas por tipo de ejercicio y botón de «pista» ya existente.
6. **Modo docentes** — activar/desactivar, resumen de conversaciones, exportar.

#### Dudas abiertas

- ¿El chat debe ser **por ejercicio** o **por sesión de juego**?
- ¿Guardamos las conversaciones en `localStorage`? (privacidad vs. continuidad)
- ¿Dejamos que el niño escriba libremente desde el primer día o solo tras usar un prompt predefinido?
- ¿Qué hacemos si el modelo se equivoca y confunde al alumno? ¿Botón «esto no es correcto» que avise?

### 1.2 🎓 Ideas de aprendizaje ⭐ · M

| Idea | Qué aporta | Prioridad | Esfuerzo |
| --- | --- | --- | --- |
| 🕵️ **Detective de errores** | Mostrar un ejercicio ya resuelto con un fallo y que el alumno lo encuentre y lo corrija. Enseña a revisar. | 🔥 | S |
| 🗣️ **«Explícamelo tú»** | El alumno escribe o graba cómo lo ha resuelto y recibe una valoración con rúbrica simple (o IA). Técnica Feynman. | 🔥 | M |
| 🔁 **Repetición espaciada** | Los fallos vuelven a los 1, 3 y 7 días, no solo en la misma sesión. | 🔥 | M |
| ⚡ **Cálculo mental exprés** | 60 segundos de operaciones sencillas, aparte de los 16 juegos. | ⭐ | S |
| 📏 **Sentido numérico** | Antes de calcular: «¿el resultado será mayor o menor que 100?». Barato y muy útil. | 🔥 | S |
| 🧱 **Manipulativos virtuales** | Regletas, bloques base 10, recta numérica y fracciones circulares para quien va justo. | ⭐ | L |
| 🌍 **Matemáticas de la vida real** | Mini-lecciones con tickets de compra, recetas, horarios y presupuestos. | ⭐ | M |
| ✍️ **Pizarra de razonamiento** | Que el niño dibuje su cuenta y el dibujo quede guardado en el historial. | 💭 | M |
| 😤 **Detección de frustración** | Tras 3 fallos seguidos, ofrecer pista o descanso en vez de otro ejercicio igual. | 🔥 | S |
| 🔬 **Errores por tipo** | Clasificar fallos (llevadas, alineación, decimales, redondeo) y mostrarlo en el panel. | ⭐ | M |

### 1.3 👥 Aula y dispositivos ⭐ · M

| Idea | Qué aporta | Prioridad | Esfuerzo |
| --- | --- | --- | --- |
| 👧 **Perfiles locales** | Varios hermanos o alumnos en el mismo dispositivo, sin cuentas ni servidor. | 🔥 | M |
| 📽️ **Modo proyector** | Fuente grande, sin distracciones y temporizador para usar en clase. | ⭐ | S |
| 📝 **Modo control** | Examen cronometrado, ayudas desactivadas y reinicio bloqueado por PIN del docente. | ⭐ | M |
| 🔗 **Retos por URL** | Un enlace genera los mismos 10 ejercicios en cualquier dispositivo (semilla en la URL, sin backend). | 🔥 | S |
| 🤝 **Modo cooperativo** | 2–4 alumnos por turnos resolviendo juntos el mismo ejercicio. | ⭐ | M |
| 🔒 **Modo kiosco** | Bloquear la navegación para tabletas compartidas del aula. | 💭 | S |

### 1.4 🧠 Metacognición y motivación ⭐ · M

| Idea | Qué aporta | Prioridad | Esfuerzo |
| --- | --- | --- | --- |
| 🎚️ **Modo sin puntos** | Desactivar puntos, rachas y medallas para quien se bloquea con la competición. | 🔥 | S |
| 🏅 **Medallas por constancia y por ayudar** | No solo por acertar: 7 días seguidos, explicar a un compañero, revisar un error. | ⭐ | S |
| 🧮 **«¿Cómo lo has pensado?»** | Tras acertar, elegir entre varias estrategias (contar, descomponer, algoritmo…). | ⭐ | M |
| 📅 **Misión semanal narrativa** | Un mapa de aventuras con 5 retos y una mascota que evoluciona. | 💭 | L |
| 💬 **Ánimos grabados** | Mensajes de voz cortos del profe o de la familia al alcanzar un hito. | 💭 | M |

### 1.5 Otras ideas 💭

- **Modo competición local**: dos jugadores en el mismo dispositivo, por turnos.
- **Reto diario**: 5 ejercicios mezclados, una vez al día, con racha propia.
- **Informe semanal** para familias: aciertos, errores más frecuentes y tiempo practicado.
- **Fichas imprimibles** en PDF a partir de los ejercicios que más falla el alumno.
- **Cuentas opcionales** para sincronizar entre dispositivos (rompe el «sin servidor», evaluar con cuidado).
- **Modo docente**: crear una lista de ejercicios y compartirla con un código corto.

---

## 2. 🎮 Juegos y contenidos ⭐ · M

### 2.1 Nuevos juegos y contenidos

| Idea | Qué aporta | Prioridad | Esfuerzo |
| --- | --- | --- | --- |
| 🃏 **Memory de fracciones equivalentes** | Emparejar fracciones que valen lo mismo. Muy visual. | 🔥 | S |
| 🎲 **¿Cuántos hay?** | Estimación por rangos (un bote de caramelos, una caja de clips). | ⭐ | S |
| 📐 **Geometría con regla y transportador virtual** | Medir ángulos y dibujar figuras con instrumentos en pantalla. | ⭐ | L |
| 🧩 **Curiosidades matemáticas** | «¿Sabías que…?» entre ejercicio y ejercicio, se puede desactivar. | ⭐ | S |
| ♻️ **Repaso de verano** | Plan de 4 semanas con 10 minutos diarios. | ⭐ | M |

### 2.2 Mejoras de los juegos existentes

- [ ] **Errores frecuentes**: detectar patrones (por ejemplo, siempre falla la resta con llevadas) y avisar en el panel.
- [ ] **Dificultad adaptativa**: si acierta mucho, subir cifras; si falla, bajarlas.
- [ ] **Repaso inteligente**: repetir los ejercicios fallados en los días siguientes.
- [ ] **Más niveles** en *Problemas* (5º–6º) y *Operaciones combinadas* (potencias, corchetes).
- [ ] **Nuevos módulos** candidatos: porcentajes, medidas de ángulos, simetría, coordenadas, estadística básica, ecuaciones sencillas.
- [ ] **Pista visual** en más juegos (como ya ocurre en *Unidades*).
- [ ] **Tiempo por ejercicio** en el historial, para ver evolución.

---

## 3. 🎨 Experiencia de uso y accesibilidad ⭐ · M

- [ ] Revisar **contraste y tamaño de letra** (WCAG AA).
- [ ] **Navegación completa con teclado** y foco visible en todos los botones.
- [ ] **Etiquetas ARIA** en los juegos con interacción compleja (columnas, fracciones, combinadas).
- [ ] Respetar `prefers-reduced-motion` (desactivar confeti y animaciones).
- [ ] **Modo oscuro**.
- [ ] **Alto contraste** para aulas con proyectores.
- [ ] Textos en **lectura fácil**: frases cortas, sin abreviaturas raras.
- [ ] Selector de **idioma** (castellano / gallego / catalán / euskera) si el proyecto crece.
- [ ] **Lectura en voz alta** de los enunciados con la voz del navegador (TTS).
- [ ] **Respuesta por voz**: decir el resultado en lugar de escribirlo.
- [ ] **Fuente para dislexia** y espaciado ajustable.
- [ ] **Sonidos opcionales** con control de volumen (hoy solo hay confeti y avisos visuales).
- [ ] **Botón «reportar un fallo»**: copia módulo, ejercicio, navegador y versión al portapapeles.

---

## 4. ⚙️ Técnico y calidad ⭐ · M

- [ ] **Pruebas automáticas** de los generadores de ejercicios (que no produzcan restas negativas, divisiones inexactas, etc.).
- [ ] **Comprobación de sintaxis y estilo** en CI (ESLint + Prettier) y despliegue automático a GitHub Pages.
- [ ] Separar el HTML en **plantillas por módulo** o generar las secciones con JS para que el archivo no crezca sin control.
- [ ] **Versionado del formato de `localStorage`** con migraciones (`mates_v4_progreso` → …).
- [ ] **Exportación/importación** más robusta, con validación y mensajes de error claros.
- [ ] Servir los JS como **módulos ES** y eliminar variables globales.
- [ ] Medir rendimiento en móviles antiguos (los juegos con dibujos en canvas son los más pesados).
- [ ] **PWA instalable** con service worker: icono en el móvil y uso offline real.
- [ ] **Copias de seguridad automáticas** y recordatorio si hace semanas que no se exporta.
- [ ] **Editor de ejercicios para el profe**: crear una ficha propia y compartirla por enlace.
- [ ] **Telemetría anónima opcional** (solo aciertos/fallos por tipo de ejercicio) para saber qué mejorar.
- [ ] **Pruebas con niños reales** antes de cada versión grande, con una lista de tareas corta.
- [ ] **App instalable de verdad** (TWA o Capacitor) con icono propio para Android/iOS.

---

## 5. 👨‍👩‍👧 Panel para familias y docentes ⭐ · M

- [ ] Vista de **resumen por alumno** (si hay cuentas) o por dispositivo.
- [ ] **Gráficas** de evolución: aciertos por semana, módulos flojos, racha.
- [ ] **Informe imprimible** en PDF.
- [ ] Aviso de **errores repetidos** con enlace directo al ejercicio.
- [ ] **Recomendaciones** generadas con reglas simples (sin IA obligatoria).
- [ ] **Mapa curricular LOMLOE**: qué saberes básicos toca cada juego e informe de competencias.
- [ ] **Informe de una página** para la reunión con familias, listo para imprimir.
- [ ] **Importar ejercicios en CSV**: el profe prepara una ficha en Excel y la sube.
- [ ] **Recordatorios locales** opt-in con notificaciones PWA, sin servidor ni cuentas.

---

## 6. 🔒 Privacidad y seguridad 🔥 · S

- [ ] Revisar que **no se envía nada a internet** salvo lo estrictamente necesario para la IA.
- [ ] Documentar en el README **qué datos salen del dispositivo** cuando la IA está activa.
- [ ] **Consentimiento** de la familia antes de usar el chat de IA (menores).
- [ ] **Borrado total** de datos en un clic, incluido el historial del chat.
- [ ] Revisar la **política del proveedor de IA**: retención, entrenamiento con los datos, ubicación de servidores.
- [ ] No usar imágenes ni nombres reales en los ejemplos enviados al modelo.

---

## 7. 🚀 Publicación y difusión 💭 · S

- [ ] Capturas y **GIF** en el README.
- [ ] Guía rápida para docentes: cómo usarlo en el aula en 5 minutos.
- [ ] Enlace directo a cada juego (`?modulo=...`) ya disponible: incluir tabla en el README.
- [ ] Publicar en repositorios de recursos educativos abiertos.
- [ ] Licencia explícita (por ejemplo, CC BY-NC-SA para el contenido y MIT para el código).
- [ ] **Changelog visible en la app**: sección «novedades» con lo último añadido.

---

## 8. 🧭 Cómo priorizar

Criterios, por orden:

1. **Seguridad y privacidad de menores** (bloquea todo lo demás).
2. **Valor didáctico real**: ¿ayuda a aprender o solo entretiene?
3. **Coste de mantenimiento**: menos dependencias, mejor.
4. **Coste económico** de la IA (uso, tokens, alojamiento).
5. **Esfuerzo** frente a impacto.

Regla práctica: nada entra en la versión publicada sin funcionar **sin conexión** y **sin IA**.

**Orden sugerido a corto plazo** (barato y con impacto):

1. 🕵️ Detective de errores
2. 📏 Sentido numérico
3. 😤 Detección de frustración
4. 🔁 Repetición espaciada
5. 👧 Perfiles locales
6. 🔗 Retos por URL
7. 📲 PWA instalable
8. 🐞 Botón «reportar un fallo»

---

## 9. 🏷️ Gestión del proyecto 💭 · S

- [ ] Convertir el roadmap en **issues de GitHub**, una por idea, con etiquetas (`idea`, `ia`, `accesibilidad`, `contenido`) y milestones.
- [ ] **Revisión trimestral** del roadmap: cerrar lo hecho, descartar lo que ya no encaje y reordenar.
- [ ] Anotar en cada issue el **motivo** y el **criterio de aceptación**, para no olvidar por qué se propuso.

---

## 📝 Registro

| Fecha | Cambio |
| --- | --- |
| 22/11/2026 | Creación del roadmap. Idea inicial: chat de IA con prompts predefinidos. |
| 23/11/2026 | Añadidas 25 ideas: aprendizaje, aula y dispositivos, accesibilidad y técnico. |
| 23/11/2026 | Añadidas 18 ideas más: metacognición, juegos nuevos, panel docente, instalación y gestión. |
