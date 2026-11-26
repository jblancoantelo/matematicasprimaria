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

## 10. 🔍 Revisión completa de la aplicación (24/11/2026)

> Revisión estática de los 16 juegos, `core.js`, `navegacion.js`, el HTML y los 18 ficheros JavaScript (`node --check` sin errores). No se probó en navegador. Esta sección recoge las propuestas que **no estaban ya** en el roadmap; cuando una idea se solapa con otra, se indica.

**Conclusión general:** la base es buena y no necesita frameworks. El margen de mejora está en tres frentes: **fiabilidad** (no perder datos ni puntuar dos veces), **feedback que enseñe** (explicar el error, no solo marcarlo) y **progresión real de 4.º** (algunos módulos permiten niveles de 6.º y otros se quedan cortos).

### 10.2 🎓 Funcionalidades para 4.º de Primaria

#### Las seis que priorizaría

| Idea | Dónde | Por qué encaja en 4.º | Prioridad | Esfuerzo |
| --- | --- | --- | --- | --- |
| 🎯 **Reto diario de 5–8 ejercicios mezclados** | Nuevo módulo o capa sobre los existentes | Sesiones cortas y variadas; hoy el niño tiene que decidir qué practicar | 🔥 | M |
| 🔁 **Repaso de mis fallos** | Historial central | Volver a los errores a los 1, 3 y 7 días es la mejora pedagógica con más impacto (solapa con *repetición espaciada*) | 🔥 | M |
| 🎚️ **Modo 4.º con ajustes predefinidos** | Cabecera y módulos | Evita configuraciones de 6.º: divisiones con divisor de 2 cifras, combinadas de 3–5 operaciones, aproximaciones a decena/centena… | 🔥 | S–M |
| ⚡ **Cálculo mental y estimación** | Nuevo módulo | 60 segundos de + − × ÷, dobles y mitades, “¿qué falta?” y “¿será mayor o menor que…?” (solapa con *cálculo mental exprés* y *sentido numérico*) | 🔥 | S–M |
| 🍕 **Fracción de una cantidad y equivalentes** | Fracciones | “3/4 de 20”, comparar equivalentes y memory de parejas: contenido clave de 4.º | 🔥 | S–M |
| 💰 **Decimales: comparar, ordenar, redondear y ×10/100** | Decimales | El módulo actual solo tiene cuadrícula, céntimos, suma y cambio; falta sentido numérico | 🔥 | S–M |

#### Otras ideas muy recomendables

- [ ] **Problemas con datos que sobran o faltan.** “¿Qué dato no necesitas?”, “¿qué dato falta?”, “elige la pregunta que se puede responder”. Trabaja comprensión lectora, no solo cálculo.
- [ ] **Dinero con céntimos y presupuestos.** Compras con decimales, precio unitario, “3 por 2”, devolución y presupuesto semanal.
- [ ] **Reloj: tiempo transcurrido y horarios.** “¿Cuánto dura una película de 17:30 a 19:15?”, horarios de trenes, formato de 24 horas y calendario.
- [ ] **Figuras compuestas.** Perímetro de polígonos, área con cuadrícula y figuras en L; “misma área, distinto perímetro”.
- [ ] **Unidades mixtas y problemas de medida.** “2 km 350 m → m”, ordenar medidas, “¿qué pesa más?” y duraciones.
- [ ] **Comparar y ordenar números grandes.** Hasta 6 cifras, forma desarrollada, recta numérica y valor posicional; complementa **Descomponer** y **Aproximaciones**.
- [ ] **Datos y gráficos.** Tablas de frecuencia y gráficos de barras: leer datos, responder preguntas y detectar el mayor/menor. Es un bloque de 4.º que ahora no está.
- [ ] **Detective de errores.** Mostrar un ejercicio resuelto con un fallo y que el niño lo encuentre (ya está en 1.2, pero encaja especialmente en 4.º).
- [ ] **Pizarra de cálculo.** Un lienzo para hacer la cuenta a mano en problemas, divisiones y multiplicaciones, sin corrección automática.
- [ ] **Lectura en voz alta.** Leer enunciados e instrucciones con la voz del navegador; ayuda a quien tiene dificultades lectoras o dislexia.
- [ ] **Modo tranquilo / sin puntos.** Ocultar puntos, rachas, confeti y cronómetro para quien se bloquea con la competición.
- [ ] **Medallas de constancia y de revisar errores.** No solo por acertar: 7 días seguidos, corregir un fallo, explicar una estrategia.
- [ ] **Perfiles locales.** Varios hermanos o alumnos en el mismo dispositivo, sin cuentas ni servidor.
- [ ] **Retos por URL con semilla.** Un enlace genera los mismos 10 ejercicios en otro dispositivo; requiere un generador aleatorio con semilla.
- [ ] **Modo profe / pizarra digital.** Pantalla grande, ayudas ocultas, temporizador y reinicio bloqueado por PIN.

### 10.3 ⚙️ Mejoras técnicas

#### P0 — Estabilidad (1–2 días)

1. **Ciclo de vida único de pregunta** en todos los módulos: `respondido`, `timerSiguiente` y `clearTimeout` al generar, con guardia para no registrar dos veces.
2. **Quitar el borrado de historial del contrarreloj** y separar las estadísticas de la sesión de las acumuladas.
3. **Cancelar temporizadores** al cambiar de pestaña, al pulsar **Generar** y al cambiar de configuración.
4. **Arreglar unidades**: regenerar al cambiar de tipo, guardar los ajustes usados y escapar el HTML del historial.
5. **Aceptar coma decimal** en problemas y unificar el parseo numérico.
6. **Confirmación antes de borrar** historiales propios y antes de generar una tanda nueva si hay respuestas.

#### P1 — Arquitectura y datos (3–5 días)

- [ ] **Historial estructurado** en lugar de solo texto: `{ t, ok, mod, tipo, enunciado, respuesta, correcta, tiempoMs, intento }`, manteniendo `l` para compatibilidad y migrando de `mates_v3_progreso` a `mates_v4_progreso`.
- [ ] **Renderizado perezoso del historial**: pintar solo los `details` abiertos y mostrar los últimos 50 con “Ver más”.
- [ ] **Gestión de cuota**: límite por módulo o compactación de resúmenes, `try/catch` en `save()` y aviso al usuario si no se puede guardar.
- [ ] **Copia de seguridad completa**: exportar e importar puntos, racha, medallas, historiales y ajustes; añadir **Borrar todos los datos**.
- [ ] **Utilidades compartidas** en `js/comun.js`: `parseNum`, `fmt`, `randInt`, `escaparHtml`, `crearId`, `programarSiguiente` y `bloquearPregunta`. Hoy `randInt`, `parseNum` y `separar` están duplicados en casi todos los módulos.
- [ ] **Generador aleatorio con semilla** (`mulberry32` o similar): permite tests deterministas y retos por URL.
- [ ] **Tests sin build**: `node --test` para los generadores (divisiones exactas, restas no negativas, redondeo, romanos, fracciones equivalentes, problemas sin resultados negativos) y `node --check` en GitHub Actions.
- [ ] **Configuración centralizada de módulos**: `MODULOS` y `TAB` están duplicados en `core.js` y en las tarjetas del HTML.

#### P2 — Calidad, accesibilidad y plataforma (1–2 semanas)

- [ ] **Accesibilidad**: `label`/`aria-label` en todos los inputs, `:focus-visible` global, objetivos táctiles de 44 px, `aria-live` en resultados, `prefers-reduced-motion`, un solo `h1` por página y `h2` en los módulos.
- [ ] **Responsive real**: probar a 320, 360, 768 y 1024 px; envolver divisiones y multiplicaciones en un contenedor con `overflow-x: auto` y usar variables CSS para el tamaño de celda.
- [ ] **PWA instalable**: `manifest.json`, iconos y service worker (funciona en GitHub Pages por HTTPS; en `file://` no se instala).
- [ ] **CSP y seguridad**: escapar todo contenido de usuario, evitar inyección de fórmulas en CSV y añadir CSP después de quitar los `onclick` inline de sumas y tablas.
- [ ] **Limpieza**: quitar funciones muertas en `divisiones.js` (`filaProducto`, `filaGuion`, `dashSpan`, `filaGuionPuntitos`), añadir `'use strict'`, unificar `var`/`let`/`const` y estilos con tokens comunes.
- [ ] **No pasar a módulos ES mientras se quiera abrir con doble clic**: Chrome bloquea los `import` desde `file://`. Si se adopta PWA o servidor local, entonces sí.

### 10.4 🗺️ Plan por fases

| Fase | Contenido | Duración |
| --- | --- | --- |
| **0. Estabilidad** ✅ | Arreglos P0: doble puntuación, temporizadores, contrarreloj de tablas, cambio de tipo en unidades, coma decimal y confirmaciones (hecha el 25/11/2026) | 1–2 días |
| **1. Base para 4.º** | Historial estructurado, renderizado perezoso, copia de seguridad completa, utilidades compartidas y primeros tests | 3–5 días |
| **2. Contenido de 4.º** | Modo 4.º, cálculo mental y estimación, fracción de cantidad, decimales y problemas con datos que sobran o faltan | 1 semana |
| **3. Plataforma** | PWA, perfiles locales, lectura en voz alta, pizarra y modo profe | 2 semanas |

**Criterios de aceptación de la fase 0:** una misma respuesta no puede puntuar dos veces; cambiar de pestaña o generar no deja temporizadores vivos; el contrarreloj no borra historial; cambiar el tipo de unidad no rompe los ejercicios; no hay scroll horizontal a 320 px; todos los inputs tienen nombre accesible.

**Recomendación:** empezar por la fase 0. El repaso de fallos necesita un historial fiable.

---

## 11. ✨ Nuevas propuestas — Gemini 4 Hydrogen (26/11/2026)

> Revisión realizada por **Gemini 4 Hydrogen** contrastando `ROADMAP.md` con `CHANGELOG.md`, `README.md` y `js/core.js`. Recoge una lista detallada de **nuevas ideas** adaptadas a 3.º–4.º de Primaria y a la arquitectura estática sin servidor, además de apuntes de estado para mantener el roadmap al día.

### 11.1 🔍 Apuntes sobre el estado actual del roadmap

- **Ya completado pero aún listado como pendiente:** en `js/core.js` ya funcionan `mates_v4_progreso` (con migración desde `mates_v3_progreso`), el aviso de almacenamiento lleno (`quota`), el renderizado perezoso de `<details>` abiertos y el botón **Ver más** de 50 en 50. También se completaron P0 (Fase 0) y parte de P2 (`:focus-visible`, `aria-label` en casillas de 6 módulos y `overflow-x: auto` en divisiones/multiplicaciones). Conviene marcarlos como hechos y actualizar las referencias a `mates_v3_progreso` en `README.md` y `AGENTS.md`.
- **Hook ya preparado:** `js/core.js` consulta `window.Comun.escaparHtml`, aunque `js/comun.js` aún no se ha creado.
- **Duplicidades y tensiones a consolidar en una próxima limpieza:** varias ideas aparecen repetidas entre las secciones 1–7 y la 10 (*Detective de errores*, *Repetición espaciada*, *Cálculo mental*, *Reto diario*, *Perfiles locales*, *Retos por URL*, *Modo proyector/profe*, *Modo sin puntos*, *Lectura en voz alta*, *Pizarra*, *PWA* y *Tests*). Además, conviene alinear la propuesta de *módulos ES* (sección 4) con la restricción de doble clic `file://` (10.3 P2), y revisar si *cuentas opcionales* / *telemetría* encajan con la política de privacidad cero-servidor (sección 6).
- **Enfoque para la IA (sección 1.1):** antes de conectar un LLM con clave o proxy, conviene implementar primero la **opción D (explicaciones deterministas por reglas)** según el error típico (llevadas, decimales, orden de operaciones), garantizando uso 100 % offline y sin riesgos de exposición de claves.

### 11.2 📚 Nuevos contenidos y mecánicas matemáticas

#### 🔎 El número escondido y prueba de la operación 🔥 · S
- **Dónde:** nuevos modos dentro de **Sumas y Restas**, **Tablas de Multiplicar** y **Divisiones**.
- **Qué es:** ejercicios inversos del tipo `? + 38 = 100`, `145 − ? = 67`, `□ × 7 = 56` y, en divisiones, comprobar el resultado aplicando la prueba real (`divisor × cociente + resto = dividendo`).
- **Por qué encaja en 3.º–4.º:** refuerza la relación entre operaciones inversas y enseña al alumno a autocorregirse en papel.
- **Implementación:** reutiliza los generadores existentes ocultando uno de los operandos en lugar del resultado; sin nuevos archivos CSS ni dependencias.

#### ✖️ Multiplicar y dividir por 10, 100 y 1000 🔥 · S
- **Dónde:** nuevo modo en **Multiplicaciones** / **Divisiones** o dentro del futuro bloque de **Cálculo mental**.
- **Qué es:** práctica específica de patrones con ceros (`45 × 100`, `3.200 ÷ 10`, `2,5 × 10`, y dobles, mitades, triples y tercios de números redondos).
- **Por qué encaja en 3.º–4.º:** es el puente imprescindible entre el cálculo natural, las **Unidades Métricas** (subir y bajar la escalera) y los **Decimales**.
- **Implementación:** generador ligero con validación directa y pista visual mostrando el desplazamiento de cifras/coma.

#### ⚖️ Balanza de igualdades (pre-álgebra visual) ⭐ · M
- **Dónde:** nuevo módulo o ampliación visual de **Propiedades**.
- **Qué es:** una balanza de dos platillos en SVG/Canvas que debe quedar equilibrada: primero igualdades numéricas (`15 + 12 = 20 + ?`) y luego incógnitas visuales sencillas (`2 cajas iguales + 4 = 18`).
- **Por qué encaja en 3.º–4.º:** trabaja el significado real del signo `=` (equivalencia, no «aquí viene el resultado») de forma mucho más adecuada para Primaria que las ecuaciones con letras.
- **Implementación:** dibujo SVG ligero con animación de inclinación según si el plato izquierdo pesa más, menos o igual.

#### 📏 Fracciones en la recta numérica y números mixtos ⭐ · S–M
- **Dónde:** módulo de **Fracciones**.
- **Qué es:** además de colorear figuras, colocar una fracción en una recta graduada entre `0` y `1` (o `0` y `2`) e identificar cuándo supera la unidad (`5/4 = 1 + 1/4`).
- **Por qué encaja en 3.º–4.º:** evita la idea limitada de que una fracción es solo «trozos de pizza» y la conecta con la medida y los decimales.
- **Implementación:** barra/recta interactiva con marcas clicables según el denominador.

#### 📐 Rectas, ángulos y simetría visual ⭐ · M
- **Dónde:** ampliación de **Perímetro y Área** (pasando a bloque de Geometría) o módulo propio.
- **Qué es:** antes de introducir regla y transportador virtual, identificar rectas paralelas, secantes y perpendiculares, clasificar ángulos (agudo, recto, obtuso) y completar figuras simétricas sobre una cuadrícula clicable.
- **Por qué encaja en 3.º–4.º:** cubre el bloque geométrico básico del currículo de 3.º y 4.º que actualmente se limita a cuadrados y rectángulos.
- **Implementación:** cuadrícula HTML/CSS o SVG interactiva por clic en celdas/vértices, totalmente accesible con teclado.

#### 🎲 Azar y probabilidad intuitiva 💭 · S
- **Dónde:** junto al bloque propuesto de **Datos y gráficos** o como minijuego propio.
- **Qué es:** situaciones con bolsas de bolas de colores, ruletas y dados para clasificar sucesos en **seguro, posible o imposible** y decidir qué resultado es **más probable**.
- **Por qué encaja en 3.º–4.º:** introduce el bloque de Estadística y Azar del currículo con apoyo gráfico inmediato y sin fórmulas complejas.
- **Implementación:** SVG dinámico de urna/ruleta con preguntas de opción múltiple.

### 11.3 🎮 Mejoras sobre los 16 juegos actuales

#### 🧮 Casillas opcionales de llevadas y guía columna a columna 🔥 · M
- **Dónde:** **Sumas y Restas**, **Multiplicaciones** y **Divisiones**.
- **Qué es:** un interruptor «Mostrar casillas de llevadas» que añade una fila superior pequeña para apuntar lo que «me llevo» y resalta la columna activa (U → D → C → UM) mientras se escribe.
- **Por qué encaja en 3.º–4.º:** ayuda a quienes aún automatizan el algoritmo vertical a no perder el hilo sin penalizar a quien ya lo hace de cabeza.
- **Implementación:** inputs auxiliares opcionales (no obligatorios para validar la respuesta) y clase CSS de resaltado por columna.

#### 📱 Teclado numérico integrado en pantalla 🔥 · M
- **Dónde:** módulos de casillas verticales (**Sumas**, **Multiplicaciones**, **Divisiones**, **Descomponer**) y **Tablas**.
- **Qué es:** un pad numérico compacto integrado en la propia interfaz (`0–9`, `,`, `←`, `✔` y flechas de casilla) activable en pantallas táctiles.
- **Por qué encaja:** en móviles y tabletas escolares, el teclado virtual del sistema tapa media operación y provoca saltos de scroll al cambiar de casilla.
- **Implementación:** componente ligero en `js/comun.js` que escribe en el `input` con foco (`inputmode="none"` cuando está activo) y avanza automáticamente de casilla.

#### 🎯 Selector de «tablas concretas» 🔥 · S
- **Dónde:** **Tablas de Multiplicar**.
- **Qué es:** casillas de selección múltiple para practicar solo un grupo elegido (por ejemplo, `6`, `7` y `8`), en lugar de limitarse a una única tabla o a todas a la vez.
- **Por qué encaja:** permite centrar sesiones cortas justo en las 2 o 3 tablas que más cuestan sin mezclar las ya dominadas (`1`, `2`, `5`, `10`).
- **Implementación:** array de tablas marcadas en `js/tablas.js` guardado en preferencias locales.

#### 🏁 Sesiones con meta corta (5, 10 o 15 ejercicios) ⭐ · S
- **Dónde:** barra superior opcional dentro de cada módulo.
- **Qué es:** elegir una meta cerrada antes de empezar («Hoy hago 10») con barra de progreso y tarjeta final de resumen de sesión (`9/10`, tiempo y racha máxima).
- **Por qué encaja:** transforma la práctica infinita en objetivos asumibles para niños de 8–10 años y reduce el abandono por cansancio.
- **Implementación:** contador de sesión independiente del historial acumulado; se desactiva libremente para práctica continua.

### 11.4 🏫 Aula, familias y distribución offline

#### 🖨️ Modo impresión directa (`@media print`) 🔥 · S
- **Dónde:** hoja de estilos global + vistas de **Problemas**, **Sumas**, **Divisiones** y **Unidades**.
- **Qué es:** reglas `@media print` para que pulsar `Ctrl+P` / Imprimir oculte cabecera, pestañas, botones e historiales y genere una ficha limpia en papel con espacio para **Nombre**, **Fecha** y cálculo manual.
- **Por qué encaja:** aporta fichas imprimibles reales de forma inmediata, sin librerías de PDF ni mantenimiento adicional.
- **Implementación:** CSS puro en `css/base.css` / `css/global.css`.

#### 🧭 Bloque «¿Por dónde empiezo?» en el inicio ⭐ · S
- **Dónde:** pantalla principal (`tab-inicio`).
- **Qué es:** una tarjeta destacada arriba con dos accesos rápidos: **«Seguir con [último juego]»** y un selector de ruta sugerida según curso (**3.º repaso** / **4.º curso**).
- **Por qué encaja:** con 16 tarjetas disponibles desde el primer segundo, evita la parálisis de elección en alumnos nuevos o familias.
- **Implementación:** lectura del último módulo usado desde `mates_v4_progreso` y lista estática de recomendaciones por curso.

#### 📦 Generador de HTML único portable (`dist/`) ⭐ · S
- **Dónde:** script de utilidad opcional en Node (solo para publicar/empaquetar, sin afectar al desarrollo modular).
- **Qué es:** un script sencillo que incrusta `css/*.css` y `js/*.js` dentro de una copia única `Aventuras_Matematicas_portable.html`.
- **Por qué encaja:** en colegios es muy frecuente que un docente haga «Guardar página como» o descargue solo `Matematicas_Primaria.html` y al abrirlo en otro equipo le falten los estilos y scripts. Con una versión portable en `dist/` o en *Releases* de GitHub, el archivo funciona de verdad con un doble clic en cualquier sitio.
- **Implementación:** script Node sin dependencias externas (`fs.readFileSync` + sustitución de `<link>` y `<script>`).

---

## 📝 Registro

| Fecha | Cambio |
| --- | --- |
| 22/11/2026 | Creación del roadmap. Idea inicial: chat de IA con prompts predefinidos. |
| 23/11/2026 | Añadidas 25 ideas: aprendizaje, aula y dispositivos, accesibilidad y técnico. |
| 23/11/2026 | Añadidas 18 ideas más: metacognición, juegos nuevos, panel docente, instalación y gestión. |
| 24/11/2026 | Añadida la sección 10 con la revisión completa: fallos priorizados, funcionalidades para 4.º, mejoras técnicas y plan por fases. |
| 25/11/2026 | Fase 0 y las tres prioridades de la revisión aplicadas en el código. |
| 26/11/2026 | Retirada del roadmap la lista de fallos ya corregidos. |
| 26/11/2026 | Añadida la sección 11 con la revisión de estado y 13 nuevas propuestas detalladas (Gemini 4 Hydrogen). |
