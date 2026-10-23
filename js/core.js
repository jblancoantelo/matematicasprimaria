
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

      function pintar(){
        var medallas = 0;
        for (var k in MODULOS) if (s.mod[k] && medallaNivel(s.mod[k].a) > 0) medallas++;

        document.getElementById('hdr-puntos').textContent = s.puntos;
        document.getElementById('hdr-racha').textContent = s.racha;
        document.getElementById('hdr-medallas').textContent = medallas;
        if (document.getElementById('hdr-aciertos')) document.getElementById('hdr-aciertos').textContent = s.aciertos;

        if (document.getElementById('ini-puntos')) {
          document.getElementById('ini-puntos').textContent = s.puntos;
          document.getElementById('ini-racha').textContent = s.racha;
          document.getElementById('ini-medallas').textContent = medallas;
          document.getElementById('ini-aciertos').textContent = s.aciertos;
        }

        var lista = document.getElementById('ini-logros');
        if (lista) {
          lista.innerHTML = '';
          for (var k in MODULOS) {
            var m = s.mod[k] || { a: 0, e: 0 };
            var lvl = medallaNivel(m.a);
            var li = document.createElement('div');
            li.className = 'ini-logro';
            li.innerHTML = '<span>' + MODULOS[k].e + ' ' + MODULOS[k].n + '</span>' +
              '<span class="num">✅ ' + m.a + ' · ❌ ' + m.e + '</span>' +
              '<span>' + MED_EMOJI[lvl] + '</span>';
            lista.appendChild(li);
          }
        }
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

      function puntuar(mod, ok){
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
        s.mod[mod] = m;
        save();
        pintar();
      }

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
        }
      });

      load();
      pintar();

      window.MatesCore = { puntuar: puntuar, pintar: pintar, medallaNivel: medallaNivel, MED_EMOJI: MED_EMOJI };
    })();
  