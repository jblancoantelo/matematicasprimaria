
    (function(){
      var KEY = 'mates_v4_progreso';
      var KEY_ANTERIOR = 'mates_v3_progreso';
      var HIST_MAX = 1000;          // respuestas guardadas por juego (las más recientes)

      var MODULOS = {
        sy:  { n: 'Sumas y Restas',         e: '🧮' },
        tm:  { n: 'Tablas de Multiplicar',  e: '✖️' },
        um:  { n: 'Unidades Métricas',      e: '📏' },
        fr:  { n: 'Fracciones',             e: '🍕' },
        de:  { n: 'Decimales y dinero',     e: '💰' },
        re:  { n: 'El Reloj',               e: '🕐' },
        nr:  { n: 'Números Romanos',        e: '🏛️' },
        pa:  { n: 'Perímetro y Área',       e: '📐' },
        md:  { n: 'Múltiplos y Divisores',  e: '🔢' },
        dm:  { n: 'Descomponer números',    e: '🧩' },
        dv:  { n: 'Divisiones',             e: '➗' },
        mu:  { n: 'Multiplicaciones',       e: '✖️' },
        ap:  { n: 'Aproximaciones',         e: '🎯' },
        pm:  { n: 'Propiedades',            e: '🔁' },
        oc:  { n: 'Operaciones combinadas', e: '🧠' },
        pr:  { n: 'Problemas',              e: '🤔' }
      };

      // Identificadores de las pestañas (los usa window.irA).
      var TAB = {
        sy: 'sumas', tm: 'tablas', um: 'unidades', fr: 'fracciones', de: 'decimales',
        re: 'reloj', nr: 'romanos', pa: 'figuras', md: 'multiplos', dm: 'descomponer',
        dv: 'divisiones', mu: 'multiplicaciones', ap: 'aproximar', pm: 'propiedades',
        oc: 'combinadas', pr: 'problemas'
      };

      var s;
      function defaultState(){
        return { puntos: 0, racha: 0, mejorRacha: 0, aciertos: 0, errores: 0, mod: {} };
      }
      function load(){
        try { s = JSON.parse(localStorage.getItem(KEY)); } catch(e){ s = null; }
        if (!s || typeof s !== 'object') {
          // Migración desde v3: se copia el progreso y se conserva el original.
          try { s = JSON.parse(localStorage.getItem(KEY_ANTERIOR)); } catch(e){ s = null; }
          if (s && typeof s === 'object') {
            if (!s.mod || typeof s.mod !== 'object') s.mod = {};
            save();
          } else {
            s = defaultState();
          }
        }
      }
      var avisoGuardado = false;
      function save(){
        try {
          localStorage.setItem(KEY, JSON.stringify(s));
          return true;
        } catch(e){
          if (!avisoGuardado) {
            avisoGuardado = true;
            brindis('⚠️ No se pudo guardar: el almacenamiento del navegador está lleno.');
          }
          return false;
        }
      }

      function medallaNivel(a){
        if (a >= 40) return 3;
        if (a >= 15) return 2;
        if (a >= 5) return 1;
        return 0;
      }
      var MED_EMOJI = { 3:'🥇', 2:'🥈', 1:'🥉', 0:'—' };
      var MED_NOMBRE = { 3:'oro', 2:'plata', 1:'bronce', 0:'sin medalla' };

      // Historial centralizado: cada módulo guarda aquí todas sus respuestas.
      var CLASES_HIST = {
        pm: { ok: 'pm-ok', ko: 'pm-ko' },
        oc: { ok: 'oc-ok', ko: 'oc-ko' }
      };

      function claseHist(mod, ok){
        var c = CLASES_HIST[mod];
        if (c) return ok ? c.ok : c.ko;
        return mod + (ok ? '-correcto' : '-incorrecto');
      }

      // Utilidades compartidas: si existe js/comun.js se usa su implementación.
      function escaparHtml(txt){
        if (window.Comun && window.Comun.escaparHtml) return window.Comun.escaparHtml(txt);
        return String(txt == null ? '' : txt)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      // Temporizadores de los módulos: se cancelan al cambiar de pestaña
      // para que una pregunta antigua no borre la nueva.
      var canceladores = [];
      function registrarCancelador(fn){
        if (typeof fn === 'function') canceladores.push(fn);
      }
      function cancelarTemporizadores(){
        for (var i = 0; i < canceladores.length; i++) {
          try { canceladores[i](); } catch (e) {}
        }
      }

      function fechaUltimo(ts){
        if (!ts) return 'Sin partidas todavía';
        var d = new Date(ts);
        if (isNaN(d.getTime())) return 'Sin partidas todavía';
        return 'Último: ' + d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
          ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      }

      function dosCifras(n){ return n < 10 ? '0' + n : String(n); }

      function claveDia(d){
        return d.getFullYear() + '-' + dosCifras(d.getMonth() + 1) + '-' + dosCifras(d.getDate());
      }

      function fechaDia(clave){
        var p = clave.split('-');
        var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
        if (isNaN(d.getTime())) return clave;
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
      }

      function agruparHistorial(m){
        var hist = m && Array.isArray(m.hist) ? m.hist : [];
        var grupos = {};
        var claves = [];
        var i, k, e;

        for (i = 0; i < hist.length; i++) {
          e = hist[i];
          if (!e || !e.t) continue;
          k = claveDia(new Date(e.t));
          if (!grupos[k]) {
            grupos[k] = { a: 0, e: 0, items: [] };
            claves.push(k);
          }
          if (e.ok) grupos[k].a++; else grupos[k].e++;
          grupos[k].items.push(e);
        }

        // Días antiguos que solo tienen recuento (sin detalle de respuestas).
        if (m && m.dias) {
          for (var dk in m.dias) {
            if (!grupos[dk]) {
              var dd = m.dias[dk] || {};
              grupos[dk] = { a: dd.a || 0, e: dd.e || 0, items: [] };
              claves.push(dk);
            }
          }
        }

        claves.sort().reverse();
        return { claves: claves, grupos: grupos };
      }

      function detalleHtml(m){
        var agrupado = agruparHistorial(m);
        var claves = agrupado.claves;
        var grupos = agrupado.grupos;

        if (!claves.length) {
          if (m && m.borrado) {
            return '<p class="ini-sin">Sin historial. Se irá guardando al responder.</p>';
          }
          if (m && m.ultimo) {
            var u = new Date(m.ultimo);
            return '<div class="ini-dia">' +
                '<span class="fecha">Hasta el ' + u.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + '</span>' +
                '<span class="marcador">✅ ' + (m.a || 0) + ' · ❌ ' + (m.e || 0) + '</span>' +
              '</div>' +
              '<p class="ini-sin">El detalle diario se empezará a guardar a partir de ahora.</p>';
          }
          return '<p class="ini-sin">Sin detalle por fechas todavía. Se irá guardando a partir de ahora.</p>';
        }

        var html = '';
        for (var i = 0; i < claves.length; i++) {
          var clave = claves[i];
          var g = grupos[clave];
          html += '<div class="ini-grupo-dia">' +
            '<div class="ini-dia">' +
              '<span class="fecha">' + fechaDia(clave) + '</span>' +
              '<span class="marcador">✅ ' + g.a + ' · ❌ ' + g.e + '</span>' +
            '</div>';
          for (var j = g.items.length - 1; j >= 0; j--) {
            var it = g.items[j];
            var hora = new Date(it.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            var ls = Array.isArray(it.l) ? it.l : [it.l];
            var lineas = [];
            for (var w = 0; w < ls.length; w++) lineas.push(escaparHtml(ls[w]));
            html += '<div class="ini-entrada ' + (it.ok ? 'ok' : 'ko') + '">' +
              '<span class="ini-hora">' + hora + '</span>' +
              '<span class="ini-texto">' + lineas.join('<br>') + '</span>' +
              '</div>';
          }
          if (!g.items.length) {
            html += '<p class="ini-sin">Solo recuento del día (detalle no disponible).</p>';
          }
          html += '</div>';
        }
        return html;
      }

      function pintar(){
        var medallas = 0;
        for (var k in MODULOS) if (s.mod[k] && medallaNivel(s.mod[k].a) > 0) medallas++;

        document.getElementById('hdr-puntos').textContent = s.puntos;
        document.getElementById('hdr-racha').textContent = s.racha;
        document.getElementById('hdr-medallas').textContent = medallas;
        if (document.getElementById('hdr-aciertos')) document.getElementById('hdr-aciertos').textContent = s.aciertos;

        var lista = document.getElementById('ini-logros');
        if (lista) {
          var abiertos = {};
          lista.querySelectorAll('details[data-mod]').forEach(function(det){
            if (det.open) abiertos[det.getAttribute('data-mod')] = true;
          });
          lista.innerHTML = '';
          for (var k in MODULOS) {
            var m = s.mod[k] || { a: 0, e: 0 };
            var lvl = medallaNivel(m.a);
            var abierto = !!abiertos[k];
            var fila = document.createElement('details');
            fila.className = 'ini-logro';
            fila.setAttribute('data-mod', k);
            if (abierto) fila.open = true;
            fila.innerHTML = '<summary class="ini-resumen">' +
                '<span class="ini-nombre">' + MODULOS[k].e + ' ' + MODULOS[k].n +
                  '<small class="ini-fecha">' + fechaUltimo(m.ultimo) + '</small></span>' +
                '<span class="num">✅ ' + m.a + ' · ❌ ' + m.e + '</span>' +
                '<span class="ini-medalla" title="Medalla: ' + MED_NOMBRE[lvl] + '">' + MED_EMOJI[lvl] + '</span>' +
              '</summary>' +
              '<div class="ini-detalle">' +
                '<div class="ini-acciones">' +
                  '<button type="button" class="ini-btn" data-ir="' + TAB[k] + '" title="Ir a ' + MODULOS[k].n + '">🎮 Ir al juego</button>' +
                  '<button type="button" class="ini-btn ini-btn-peligro" data-borrar="' + k + '" title="Borrar solo el historial de ' + MODULOS[k].n + '">🗑️ Borrar historial</button>' +
                '</div>' +
                '<div class="ini-detalle-historico" data-render="' + (abierto ? '1' : '0') + '">' +
                  (abierto ? detalleHtml(m) : '') +
                '</div>' +
              '</div>';
            lista.appendChild(fila);
          }
        }
      }

      var visiblesHistorial = {};

      function pintarHistorial(mod){
        var lista = document.getElementById(mod + '-listaHistorial');
        if (!lista) return;
        var m = s.mod[mod];
        var hist = m && Array.isArray(m.hist) ? m.hist : [];
        var limite = visiblesHistorial[mod] || 50;
        lista.innerHTML = '';
        var desde = Math.max(0, hist.length - limite);
        for (var i = hist.length - 1; i >= desde; i--) {
          var e = hist[i];
          lista.appendChild(itemHistorial(claseHist(mod, e.ok), e.l, e.t));
        }
        if (desde > 0) {
          var li = document.createElement('li');
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ini-btn';
          btn.textContent = 'Ver más (' + desde + ' anteriores)';
          btn.addEventListener('click', function(){
            visiblesHistorial[mod] = limite + 50;
            pintarHistorial(mod);
          });
          li.appendChild(btn);
          lista.appendChild(li);
        }
      }

      function borrarHistorial(mod){
        if (!s.mod[mod]) return;
        s.mod[mod].hist = [];
        s.mod[mod].dias = {};
        s.mod[mod].borrado = true;
        save();
        pintarHistorial(mod);
        pintar();
      }

      // Borra absolutamente todo lo que la aplicación guarda en este navegador.
      function borrarTodo(){
        if (!confirm('¿Borrar TODOS los datos de Aventuras Matemáticas?\n' +
            'Se eliminan puntos, medallas, historiales y las tandas propias de Problemas y Unidades.\n' +
            'Esta acción no se puede deshacer.')) return false;
        var claves = [
          KEY,
          KEY_ANTERIOR,
          'problemas_matematicas_primaria_historial_v2',
          'problemas_matematicas_3primaria_historial_v1',
          'metricHistory'
        ];
        try {
          // Cualquier otra clave de la app con el prefijo mates_.
          for (var i = localStorage.length - 1; i >= 0; i--) {
            var k = localStorage.key(i);
            if (k && k.indexOf('mates_') === 0 && claves.indexOf(k) === -1) claves.push(k);
          }
          for (var j = 0; j < claves.length; j++) localStorage.removeItem(claves[j]);
        } catch (e) {
          alert('No se pudieron borrar los datos del navegador.');
          return false;
        }
        s = defaultState();
        pintar();
        for (var kk in MODULOS) pintarHistorial(kk);
        brindis('🧨 Datos borrados · recargando…');
        setTimeout(function(){ window.location.reload(); }, 700);
        return true;
      }

      function leerExtra(clave){
        try {
          var datos = JSON.parse(localStorage.getItem(clave) || 'null');
          return (datos && typeof datos === 'object') ? datos : null;
        } catch (e) {
          return null;
        }
      }

      function datosHistorial(){
        var modulos = {};
        for (var k in MODULOS) {
          var m = s.mod[k] || {};
          modulos[k] = {
            hist: Array.isArray(m.hist) ? m.hist : [],
            dias: (m.dias && typeof m.dias === 'object') ? m.dias : {},
            a: m.a || 0,
            e: m.e || 0,
            ultimo: m.ultimo || 0,
            borrado: !!m.borrado
          };
        }
        return {
          app: 'Aventuras Matemáticas',
          tipo: 'copia-completa',
          version: 2,
          exportado: new Date().toISOString(),
          progreso: {
            puntos: s.puntos,
            racha: s.racha,
            mejorRacha: s.mejorRacha,
            aciertos: s.aciertos,
            errores: s.errores
          },
          modulos: modulos,
          extras: {
            problemas: leerExtra('problemas_matematicas_primaria_historial_v2'),
            unidades: leerExtra('metricHistory')
          }
        };
      }

      function descargarArchivo(nombre, contenido, tipoMime){
        try {
          var blob = new Blob([contenido], { type: tipoMime });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = nombre;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
          return true;
        } catch (e) {
          alert('No se pudo descargar el archivo.');
          return false;
        }
      }

      function nombreHistorial(ext){
        return 'historial-mates-' + claveDia(new Date()) + '.' + ext;
      }

      function exportarHistorialJson(){
        var texto = JSON.stringify(datosHistorial(), null, 2);
        if (descargarArchivo(nombreHistorial('json'), texto, 'application/json;charset=utf-8')) {
          brindis('⬇️ Historial JSON descargado');
        }
      }

      function exportarHistorialHtml(){
        var esc = escaparHtml;
        var css = [
          'body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#1f2937;background:#fff;line-height:1.45}',
          'h1{margin:0 0 4px;font-size:24px}',
          '.meta{margin:0 0 20px;color:#64748b;font-size:13px}',
          'section{border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin-bottom:16px}',
          'h2{margin:0 0 4px;font-size:18px}',
          'h2 .med{font-size:22px;margin-left:6px}',
          '.tot{margin:0 0 10px;color:#475569;font-size:13px}',
          'h3{margin:12px 0 4px;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0;padding-bottom:2px}',
          '.dia-tot{float:right;font-weight:400;color:#64748b}',
          'ul{margin:0;padding:0;list-style:none}',
          'li{font-size:13px;padding:3px 0 3px 14px;position:relative}',
          'li::before{content:"▸";position:absolute;left:0;color:#2563eb}',
          'li.ok{color:#15803d}',
          'li.ko{color:#b91c1c}',
          '.hora{color:#64748b}',
          '.vacio{color:#94a3b8;font-size:13px;margin:4px 0}'
        ].join('');
        var html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
          '<title>Historial · Aventuras Matemáticas</title><style>' + css + '</style></head><body>' +
          '<h1>Historial · Aventuras Matemáticas</h1>' +
          '<p class="meta">Exportado el ' + esc(fechaHora()) + '</p>';

        for (var k in MODULOS) {
          var m = s.mod[k] || {};
          var agrupado = agruparHistorial(m);
          var lvl = medallaNivel(m.a || 0);
          html += '<section><h2>' + esc(MODULOS[k].e + ' ' + MODULOS[k].n) +
            '<span class="med">' + MED_EMOJI[lvl] + '</span></h2>' +
            '<p class="tot">✅ ' + (m.a || 0) + ' aciertos · ❌ ' + (m.e || 0) + ' fallos · ' +
            esc(fechaUltimo(m.ultimo)) + '</p>';

          if (!agrupado.claves.length) {
            html += '<p class="vacio">Sin historial.</p>';
          } else {
            for (var i = 0; i < agrupado.claves.length; i++) {
              var clave = agrupado.claves[i];
              var g = agrupado.grupos[clave];
              html += '<h3>' + esc(fechaDia(clave)) +
                '<span class="dia-tot">✅ ' + g.a + ' · ❌ ' + g.e + '</span></h3>';
              if (!g.items.length) {
                html += '<p class="vacio">Solo recuento del día (detalle no disponible).</p>';
              } else {
                html += '<ul>';
                for (var j = g.items.length - 1; j >= 0; j--) {
                  var it = g.items[j];
                  var hora = new Date(it.t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  var ls = Array.isArray(it.l) ? it.l : [it.l];
                  var lineas = [];
                  for (var w = 0; w < ls.length; w++) lineas.push(esc(ls[w]));
                  html += '<li class="' + (it.ok ? 'ok' : 'ko') + '"><span class="hora">' + hora + '</span> ' +
                    lineas.join('<br>') + '</li>';
                }
                html += '</ul>';
              }
            }
          }
          html += '</section>';
        }
        html += '</body></html>';

        if (descargarArchivo(nombreHistorial('html'), html, 'text/html;charset=utf-8')) {
          brindis('⬇️ Historial HTML descargado');
        }
      }

      function importarHistorial(texto){
        var datos;
        try { datos = JSON.parse(texto); } catch (e) {
          alert('El archivo no es un JSON válido.');
          return;
        }
        var modulos = datos && datos.modulos;
        if (!modulos || typeof modulos !== 'object') {
          alert('El JSON no tiene el formato de historial esperado.');
          return;
        }
        var esCopia = !!(datos.progreso && typeof datos.progreso === 'object');
        var aviso = esCopia
          ? '¿Restaurar esta copia de seguridad?\nSe reemplazan puntos, racha, historiales y los historiales propios de Problemas y Unidades.'
          : '¿Reemplazar TODO el historial actual por el del archivo?\nLos puntos se mantienen y los aciertos y las medallas se recalculan desde el historial importado.';
        if (!confirm(aviso)) return;

        for (var k in MODULOS) {
          var m = s.mod[k] || { a: 0, e: 0 };
          var entrada = modulos[k] || {};
          var hist = [];
          if (Array.isArray(entrada.hist)) {
            for (var i = 0; i < entrada.hist.length; i++) {
              var e = entrada.hist[i];
              if (!e || typeof e.t !== 'number' || !isFinite(e.t)) continue;
              var l = [];
              if (Array.isArray(e.l)) {
                for (var j = 0; j < e.l.length; j++) l.push(e.l[j] == null ? '' : String(e.l[j]));
              }
              var item = { t: e.t, ok: !!e.ok, l: l, mod: typeof e.mod === 'string' ? e.mod : k };
              if (e.tipo != null) item.tipo = String(e.tipo);
              if (e.enunciado != null) item.enunciado = String(e.enunciado);
              if (e.respuesta != null) item.respuesta = String(e.respuesta);
              if (e.correcta != null) item.correcta = String(e.correcta);
              if (typeof e.tiempoMs === 'number' && isFinite(e.tiempoMs)) item.tiempoMs = Math.round(e.tiempoMs);
              if (typeof e.intento === 'number' && isFinite(e.intento)) item.intento = e.intento;
              hist.push(item);
            }
          }
          hist.sort(function(a, b){ return a.t - b.t; });
          if (hist.length > HIST_MAX) hist = hist.slice(hist.length - HIST_MAX);

          var dias = {};
          if (entrada.dias && typeof entrada.dias === 'object') {
            for (var dk in entrada.dias) {
              var dd = entrada.dias[dk] || {};
              dias[dk] = { a: Number(dd.a) || 0, e: Number(dd.e) || 0 };
            }
          }

          // Recalcula los contadores del módulo para que coincidan con el historial.
          var ca = 0, ce = 0, i2;
          if (hist.length) {
            for (i2 = 0; i2 < hist.length; i2++) {
              if (hist[i2].ok) ca++; else ce++;
            }
          } else if (Object.keys(dias).length) {
            for (var dk2 in dias) {
              ca += dias[dk2].a || 0;
              ce += dias[dk2].e || 0;
            }
          } else {
            // Copias antiguas: conserva los contadores sin detalle.
            ca = Math.max(0, Number(entrada.a) || 0);
            ce = Math.max(0, Number(entrada.e) || 0);
          }
          m.hist = hist;
          m.dias = dias;
          m.a = ca;
          m.e = ce;
          m.borrado = !(hist.length || Object.keys(dias).length || ca || ce);
          m.ultimo = hist.length ? hist[hist.length - 1].t : Math.max(0, Number(entrada.ultimo) || 0);
          s.mod[k] = m;
        }

        // Copia completa: restaura también puntos y racha.
        if (esCopia) {
          var p = datos.progreso;
          function num0(v){ return (typeof v === 'number' && isFinite(v) && v >= 0) ? Math.floor(v) : 0; }
          s.puntos = num0(p.puntos);
          s.racha = num0(p.racha);
          s.mejorRacha = Math.max(num0(p.mejorRacha), s.racha);
        }

        // Los totales globales se recalculan a partir de los módulos.
        var totA = 0, totE = 0;
        for (var k2 in MODULOS) {
          if (s.mod[k2]) {
            totA += s.mod[k2].a || 0;
            totE += s.mod[k2].e || 0;
          }
        }
        s.aciertos = totA;
        s.errores = totE;

        // Historiales propios de Problemas y Unidades.
        var extras = datos.extras;
        var extrasRestaurados = false;
        if (extras && typeof extras === 'object') {
          try {
            if (extras.problemas && typeof extras.problemas === 'object') {
              localStorage.setItem('problemas_matematicas_primaria_historial_v2', JSON.stringify(extras.problemas));
              extrasRestaurados = true;
            }
            if (Array.isArray(extras.unidades)) {
              localStorage.setItem('metricHistory', JSON.stringify(extras.unidades));
              extrasRestaurados = true;
            }
          } catch (e2) {
            brindis('⚠️ No se pudieron restaurar los historiales propios.');
          }
        }

        save();
        pintar();
        for (var kk in MODULOS) pintarHistorial(kk);
        brindis(extrasRestaurados ? '📥 Copia restaurada · recargando…' : '📥 Historial importado');
        if (extrasRestaurados) setTimeout(function(){ window.location.reload(); }, 800);
      }

      function confetti(){
        var colores = ['#f59e0b','#ef4444','#3b82f6','#22c55e','#a855f7','#ec4899','#14b8a6'];
        for (var i = 0; i < 20; i++) {
          var d = document.createElement('div');
          d.className = 'confeti';
          d.style.left = (Math.random() * 100) + 'vw';
          d.style.background = colores[Math.floor(Math.random() * colores.length)];
          d.style.animationDelay = (Math.random() * 0.2) + 's';
          d.style.animationDuration = (0.9 + Math.random() * 0.9) + 's';
          document.body.appendChild(d);
          (function(el){ setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, 2200); })(d);
        }
      }

      var toastTemporizador = null;
      function brindis(msg){
        var el = document.getElementById('toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        if (toastTemporizador) clearTimeout(toastTemporizador);
        toastTemporizador = setTimeout(function(){ el.classList.remove('show'); }, 2400);
      }

      function registrar(mod, ok, lineas, extra){
        ok = !!ok;
        var ahora = Date.now();

        if (!ok) {
          s.errores++;
          s.racha = 0;
        } else {
          s.aciertos++;
          s.racha++;
          if (s.racha > s.mejorRacha) s.mejorRacha = s.racha;
          var ganados = 10 + Math.min(s.racha - 1, 10);
          if (s.racha > 0 && s.racha % 5 === 0) ganados += 5;
          s.puntos += ganados;
          confetti();
          if (s.racha % 5 === 0) brindis('🔥 ¡Racha de ' + s.racha + '! +' + ganados + ' pts');
        }

        var m = s.mod[mod] || { a: 0, e: 0 };
        if (ok) m.a++; else m.e++;
        m.ultimo = ahora;
        if (!m.dias || typeof m.dias !== 'object') m.dias = {};
        var clave = claveDia(new Date(ahora));
        var dia = m.dias[clave] || { a: 0, e: 0 };
        if (ok) dia.a++; else dia.e++;
        m.dias[clave] = dia;

        if (lineas != null) {
          if (!Array.isArray(m.hist)) m.hist = [];
          var arr = Array.isArray(lineas) ? lineas : [lineas];
          var l = [];
          for (var i = 0; i < arr.length; i++) l.push(arr[i] == null ? '' : String(arr[i]));
          var entrada = { t: ahora, ok: ok, l: l, mod: mod };
          // Detalle estructurado opcional (historial v4).
          if (extra && typeof extra === 'object') {
            if (extra.tipo != null) entrada.tipo = String(extra.tipo);
            if (extra.enunciado != null) entrada.enunciado = String(extra.enunciado);
            if (extra.respuesta != null) entrada.respuesta = String(extra.respuesta);
            if (extra.correcta != null) entrada.correcta = String(extra.correcta);
            if (typeof extra.tiempoMs === 'number' && isFinite(extra.tiempoMs) && extra.tiempoMs >= 0) {
              entrada.tiempoMs = Math.round(extra.tiempoMs);
            }
            if (typeof extra.intento === 'number' && isFinite(extra.intento)) {
              entrada.intento = extra.intento;
            }
          }
          m.hist.push(entrada);
          if (m.hist.length > HIST_MAX) m.hist.splice(0, m.hist.length - HIST_MAX);
          m.borrado = false;
        }

        s.mod[mod] = m;
        save();
        pintar();
        if (lineas != null) pintarHistorial(mod);
      }

      // Compatibilidad: los módulos que no aporten detalle siguen sumando puntos.
      function puntuar(mod, ok){ registrar(mod, ok); }

      // Botones "ir a módulo" del panel de inicio
      document.querySelectorAll('.card-modulo').forEach(function(card){
        card.addEventListener('click', function(){
          window.irA(card.getAttribute('data-ir'));
        });
      });

      document.getElementById('btn-reset').addEventListener('click', function(){
        if (confirm('¿Seguro que quieres borrar TODOS los puntos y medallas?')) {
          s = defaultState();
          save();
          pintar();
          for (var k in MODULOS) pintarHistorial(k);
          brindis('🧹 Puntos y medallas reiniciados');
          // Recarga para que los contadores locales de cada juego queden a cero.
          setTimeout(function(){ window.location.reload(); }, 700);
        }
      });

      var btnBorrarTodo = document.getElementById('btn-borrar-todo');
      if (btnBorrarTodo) {
        btnBorrarTodo.addEventListener('click', borrarTodo);
      }

      var listaLogros = document.getElementById('ini-logros');
      if (listaLogros) {
        // El detalle se genera solo al abrir cada módulo (rendimiento).
        listaLogros.addEventListener('toggle', function(ev){
          var det = ev.target;
          if (!det || det.tagName !== 'DETAILS' || !det.open) return;
          var k = det.getAttribute('data-mod');
          var cont = det.querySelector('.ini-detalle-historico');
          if (k && cont && cont.getAttribute('data-render') !== '1') {
            var m = s.mod[k] || { a: 0, e: 0 };
            cont.innerHTML = detalleHtml(m);
            cont.setAttribute('data-render', '1');
          }
        }, true);

        listaLogros.addEventListener('click', function(ev){
          var btn = ev.target.closest ? ev.target.closest('button[data-ir], button[data-borrar]') : null;
          if (!btn) return;
          var modIr = btn.getAttribute('data-ir');
          if (modIr) {
            ev.preventDefault();
            if (window.irA) window.irA(modIr);
            return;
          }
          var modBorrar = btn.getAttribute('data-borrar');
          if (modBorrar) {
            ev.preventDefault();
            var nombre = MODULOS[modBorrar] ? MODULOS[modBorrar].n : modBorrar;
            if (confirm('¿Borrar solo el historial de "' + nombre + '"?\nLos puntos y medallas no se borran.')) {
              borrarHistorial(modBorrar);
            }
          }
        });
      }

      var btnExport = document.getElementById('btn-export');
      var menuExport = document.getElementById('ini-menu-export');
      if (btnExport && menuExport) {
        btnExport.addEventListener('click', function(ev){
          ev.stopPropagation();
          menuExport.hidden = !menuExport.hidden;
          btnExport.setAttribute('aria-expanded', menuExport.hidden ? 'false' : 'true');
        });
        menuExport.addEventListener('click', function(ev){
          var b = ev.target.closest ? ev.target.closest('button[data-export]') : null;
          if (!b) return;
          var fmt = b.getAttribute('data-export');
          menuExport.hidden = true;
          btnExport.setAttribute('aria-expanded', 'false');
          if (fmt === 'json') exportarHistorialJson();
          else exportarHistorialHtml();
        });
        document.addEventListener('click', function(ev){
          if (!menuExport.hidden && !menuExport.contains(ev.target) && ev.target !== btnExport) {
            menuExport.hidden = true;
            btnExport.setAttribute('aria-expanded', 'false');
          }
        });
        document.addEventListener('keydown', function(ev){
          if (ev.key === 'Escape' && !menuExport.hidden) {
            menuExport.hidden = true;
            btnExport.setAttribute('aria-expanded', 'false');
          }
        });
      }

      var btnImport = document.getElementById('btn-import');
      var inputImport = document.getElementById('ini-import-file');
      if (btnImport && inputImport) {
        btnImport.addEventListener('click', function(){ inputImport.click(); });
        inputImport.addEventListener('change', function(){
          var file = inputImport.files && inputImport.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(){
            importarHistorial(String(reader.result || ''));
            inputImport.value = '';
          };
          reader.onerror = function(){
            alert('No se pudo leer el archivo.');
            inputImport.value = '';
          };
          reader.readAsText(file);
        });
      }

      load();
      pintar();
      for (var kMod in MODULOS) pintarHistorial(kMod);

      function fechaHoraDe(ts){
        var d = new Date(ts);
        if (isNaN(d.getTime())) d = new Date();
        var fecha = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        var hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return fecha + ' · ' + hora;
      }

      function fechaHora(){ return fechaHoraDe(Date.now()); }

      function itemHistorial(clase, lineas, ts){
        var li = document.createElement('li');
        if (clase) li.className = clase;

        var cuando = document.createElement('div');
        cuando.className = 'hist-fecha';
        cuando.textContent = fechaHoraDe(ts);
        li.appendChild(cuando);

        var arr = Array.isArray(lineas) ? lineas : [lineas];
        var esFallo = !!clase && /(ko|incorrecto)$/.test(clase);
        for (var i = 0; i < arr.length; i++) {
          var linea = document.createElement('div');
          linea.className = i === 0 ? 'hist-texto' : 'hist-texto hist-detalle';
          if (esFallo && i === arr.length - 1 && arr.length > 1) linea.classList.add('hist-bien');
          linea.textContent = arr[i] == null ? '' : String(arr[i]);
          li.appendChild(linea);
        }
        return li;
      }

      window.MatesCore = {
        puntuar: puntuar,
        registrar: registrar,
        pintar: pintar,
        pintarHistorial: pintarHistorial,
        borrarHistorial: borrarHistorial,
        borrarTodo: borrarTodo,
        exportarHistorialJson: exportarHistorialJson,
        exportarHistorialHtml: exportarHistorialHtml,
        importarHistorial: importarHistorial,
        registrarCancelador: registrarCancelador,
        cancelarTemporizadores: cancelarTemporizadores,
        medallaNivel: medallaNivel,
        MED_EMOJI: MED_EMOJI,
        fechaHora: fechaHora,
        itemHistorial: itemHistorial
      };
    })();
  