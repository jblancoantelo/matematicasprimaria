
    (function(){
      var KEY = 'mates_v3_progreso';

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

      var s;
      function defaultState(){
        return { puntos: 0, racha: 0, mejorRacha: 0, aciertos: 0, errores: 0, mod: {} };
      }
      function load(){
        try { s = JSON.parse(localStorage.getItem(KEY)); } catch(e){ s = null; }
        if (!s || typeof s !== 'object') s = defaultState();
      }
      function save(){
        try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){}
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

      function escaparHtml(txt){
        return String(txt == null ? '' : txt)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
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

      function detalleHtml(m){
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

        if (!claves.length) {
          if (m && m.borrado) {
            return '<p class="ini-sin">Historial borrado. Se volverá a guardar al responder.</p>';
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

        claves.sort().reverse();
        var html = '';
        for (i = 0; i < claves.length; i++) {
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
            var fila = document.createElement('details');
            fila.className = 'ini-logro';
            fila.setAttribute('data-mod', k);
            if (abiertos[k]) fila.open = true;
            fila.innerHTML = '<summary class="ini-resumen">' +
                '<span class="ini-nombre">' + MODULOS[k].e + ' ' + MODULOS[k].n +
                  '<small class="ini-fecha">' + fechaUltimo(m.ultimo) + '</small></span>' +
                '<span class="num">✅ ' + m.a + ' · ❌ ' + m.e + '</span>' +
                '<span class="ini-medalla" title="Medalla: ' + MED_NOMBRE[lvl] + '">' + MED_EMOJI[lvl] + '</span>' +
              '</summary>' +
              '<div class="ini-detalle">' +
                '<div class="ini-acciones">' +
                  '<button type="button" class="ini-btn" data-ir="' + k + '" title="Ir a ' + MODULOS[k].n + '">🎮 Ir al juego</button>' +
                  '<button type="button" class="ini-btn ini-btn-peligro" data-borrar="' + k + '" title="Borrar solo el historial de ' + MODULOS[k].n + '">🗑️ Borrar historial</button>' +
                '</div>' +
                detalleHtml(m) +
              '</div>';
            lista.appendChild(fila);
          }
        }
      }

      function pintarHistorial(mod){
        var lista = document.getElementById(mod + '-listaHistorial');
        if (!lista) return;
        var m = s.mod[mod];
        var hist = m && Array.isArray(m.hist) ? m.hist : [];
        lista.innerHTML = '';
        for (var i = hist.length - 1; i >= 0; i--) {
          var e = hist[i];
          lista.appendChild(itemHistorial(claseHist(mod, e.ok), e.l, e.t));
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

      function registrar(mod, ok, lineas){
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
          m.hist.push({ t: ahora, ok: ok, l: l });
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
        }
      });

      var listaLogros = document.getElementById('ini-logros');
      if (listaLogros) {
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
        medallaNivel: medallaNivel,
        MED_EMOJI: MED_EMOJI,
        fechaHora: fechaHora,
        itemHistorial: itemHistorial
      };
    })();
  