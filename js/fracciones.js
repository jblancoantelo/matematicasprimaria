
    (function(){
      let actual = null;
      let aciertos = 0;
      let errores = 0;
      let respondido = true;

      function mostrarFraccion(){ return document.getElementById('tab-fracciones').classList.contains('active'); }

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      function mcd(a, b){
        a = Math.abs(a); b = Math.abs(b);
        while (b) { const t = a % b; a = b; b = t; }
        return a || 1;
      }

      function barra(num, den, clase){
        let h = '<div class="fr-bar">';
        for (let i = 0; i < den; i++) h += `<div class="fr-cell${i < num ? ' fr-llena' + (clase || '') : ''}"></div>`;
        h += '</div>';
        return h;
      }

      function parseFraccion(s){
        const t = ('' + s).trim();
        const m = t.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
        if (m) return { n: parseInt(m[1], 10), d: parseInt(m[2], 10) };
        const num = parseFloat(t.replace(',', '.'));
        if (Number.isFinite(num)) return { n: num, d: 1 };
        return null;
      }

      function simplificar(n, d){
        const g = mcd(n, d);
        return { n: n / g, d: d / g };
      }

      function iguales(a, b){ return a.n * b.d === b.n * a.d; }

      document.addEventListener('keydown', function(e){
        if (e.key !== 'Enter') return;
        const t = e.target;
        if (t && (t.tagName === 'BUTTON' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.tagName === 'A')) return;
        if (mostrarFraccion()) {
          e.preventDefault();
          verificar();
        }
      });

      document.getElementById('fr-generar').addEventListener('click', generar);
      document.getElementById('fr-verificar').addEventListener('click', verificar);
      document.getElementById('fr-tipo').addEventListener('change', function(){ generar(); });

      function generar(){
        const tipo = document.getElementById('fr-tipo').value;
        document.getElementById('fr-resultado').textContent = '';
        document.getElementById('fr-resultado').className = '';
        document.getElementById('fr-respuesta').value = '';
        actual = null;
        respondido = true;

        const visual = document.getElementById('fr-visual');
        const enunciado = document.getElementById('fr-enunciado');

        if (tipo === 'identificar') {
          const den = randInt(2, 10);
          const num = randInt(1, den - 1);
          actual = { tipo, ref: simplificar(num, den), texto: `${num}/${den}` };
          visual.innerHTML = barra(num, den);
          enunciado.innerHTML = `¿Qué fracción está coloreada? Escribe numerador y denominador (por ejemplo <strong>3/4</strong>).`;
        } else if (tipo === 'operar') {
          const den = randInt(2, 10);
          const a = randInt(1, den - 1);
          const op = randInt(0, 1) === 0 ? '+' : '-';
          const b = op === '-' ? randInt(1, a) : randInt(1, den - a);
          const numr = op === '+' ? a + b : a - b;
          const sim = simplificar(numr, den);
          actual = { tipo, ref: sim, texto: `${a}/${den} ${op} ${b}/${den} = ${numr}/${den}` };
          visual.innerHTML = `<div class="fr-fila"><div class="fr-bloque"><p>${a}/${den}</p>${barra(a, den)}</div><div class="fr-bloque"><p>${b}/${den}</p>${barra(b, den, op === '-' ? ' fr-quita' : '')}</div></div>`;
          enunciado.innerHTML = `¿Cuánto es <strong>${a}/${den} ${op} ${b}/${den}</strong>? Escribe la fracción resultado (por ejemplo <strong>5/8</strong>).`;
        } else {
          let d1, n1, d2, n2, v1, v2;
          if (Math.random() < 0.35) {
            // Fracciones equivalentes: a veces el símbolo correcto es «=».
            d1 = randInt(2, 5); n1 = randInt(1, d1 - 1);
            const k = randInt(2, 3);
            d2 = d1 * k; n2 = n1 * k;
            v1 = n1 / d1; v2 = n2 / d2;
          } else {
            do {
              d1 = randInt(2, 8); n1 = randInt(1, d1 - 1);
              d2 = randInt(2, 8); n2 = randInt(1, d2 - 1);
              v1 = n1 / d1; v2 = n2 / d2;
            } while (Math.abs(v1 - v2) < 1e-9);
          }
          const simbolo = Math.abs(v1 - v2) < 1e-9 ? '=' : (v1 < v2 ? '<' : '>');
          actual = { tipo, simbolo, texto: `${n1}/${d1} ${simbolo} ${n2}/${d2}` };
          visual.innerHTML = `<div class="fr-fila"><div class="fr-bloque"><p>${n1}/${d1}</p>${barra(n1, d1)}</div><div class="fr-bloque"><p>${n2}/${d2}</p>${barra(n2, d2)}</div></div>`;
          enunciado.innerHTML = `¿Qué símbolo va en el hueco? <strong>${n1}/${d1} [ ] ${n2}/${d2}</strong>. Escribe <strong>&gt;</strong>, <strong>&lt;</strong> o <strong>=</strong>.`;
        }
        respondido = false;
      }

      function verificar(){
        if (!actual || respondido) return;
        const entrada = document.getElementById('fr-respuesta').value.trim();
        if (entrada === '') return;
        respondido = true;
        let esCorrecto = false;
        const resultado = document.getElementById('fr-resultado');

        if (actual.tipo === 'comparar') {
          esCorrecto = entrada === actual.simbolo;
        } else {
          const f = parseFraccion(entrada);
          if (f) esCorrecto = iguales(f, actual.ref);
        }

        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto!';
          resultado.className = 'fr-correcto';
          aciertos++;
        } else {
          resultado.textContent = `❌ Incorrecto. La respuesta era ${actual.texto}.`;
          resultado.className = 'fr-incorrecto';
          errores++;
        }

        document.getElementById('fr-aciertos').textContent = aciertos;
        document.getElementById('fr-errores').textContent = errores;

        const correcta = actual.tipo === 'comparar'
          ? actual.simbolo
          : actual.ref.n + '/' + actual.ref.d;
        const lineas = esCorrecto
          ? ['✅ Tú: ' + entrada + ' · ' + actual.texto]
          : ['❌ Tú: ' + entrada, '✔️ Correcto: ' + correcta + ' · ' + actual.texto];
        window.MatesCore.registrar('fr', esCorrecto, lineas);
      }
    })();
  