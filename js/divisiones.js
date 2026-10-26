
    (function(){
      let dividendo = 0, divisor = 0, cociente = 0, resto = 0;
      let dgs = [];
      let pasos = [];
      let pasoActual = 0;
      let aciertos = 0;
      let errores = 0;
      let comprobado = true;

      function aleatorioInt(min, max){ return min + Math.floor(Math.random() * (max - min + 1)); }
      function separar(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

      // Planifica los pasos de la división (como se hace en el papel)
      function calcularPasos(){
        pasos = [];
        let idx = 0;
        let cur = 0;
        while (idx < dgs.length) {
          cur = cur * 10 + dgs[idx];
          idx++;
          if (cur >= divisor) break;
        }
        for (;;) {
          const qd = Math.floor(cur / divisor);
          const prod = qd * divisor;
          const rem = cur - prod;
          pasos.push({ colEnd: idx - 1, nem: cur, qd: qd, prod: prod, rem: rem, final: idx >= dgs.length });
          if (idx >= dgs.length) break;
          cur = rem * 10 + dgs[idx];
          idx++;
        }
      }

      function generar(){
        const selDvd = document.getElementById('dv-dvdCifras');
        const selDvs = document.getElementById('dv-dvsCifras');
        let dvdC = parseInt(selDvd.value, 10);
        let dvsC = parseInt(selDvs.value, 10);
        if (dvsC >= dvdC) { dvsC = Math.max(1, dvdC - 1); selDvs.value = String(dvsC); }

        const dvsMin = Math.max(2, Math.pow(10, dvsC - 1));
        const dvsMax = Math.pow(10, dvsC) - 1;
        const qd = Math.max(1, dvdC - dvsC);
        const cocMin = Math.pow(10, qd - 1);
        const cocMax = Math.pow(10, qd) - 1;

        let intentos = 0;
        do {
          divisor = aleatorioInt(dvsMin, dvsMax);
          cociente = aleatorioInt(cocMin, cocMax);
          resto = aleatorioInt(0, divisor - 1);
          dividendo = divisor * cociente + resto;
          intentos++;
        } while (String(dividendo).length !== dvdC && intentos < 200);

        dgs = String(dividendo).split('').map(Number);
        calcularPasos();
        pasoActual = 0;
        comprobado = false;

        document.getElementById('dv-resultado').textContent = '';
        document.getElementById('dv-resultado').className = '';
        const boton = document.getElementById('dv-paso');
        boton.textContent = '✔️ Comprobar paso';
        boton.disabled = false;
        rend();
      }

      function pasoDeCol(col){
        for (let k = 0; k < pasos.length; k++) if (pasos[k].colEnd === col) return k;
        return -1;
      }

      function celdaVacia(){
        return '<span class="dv-cel"></span>';
      }

      function filaNumero(numero, hasta, cls){
        const s = String(numero);
        let r = '<div class="dv-fila">';
        const inicio = hasta - s.length + 1;
        for (let i = 0; i < inicio; i++) r += celdaVacia();
        for (let i = 0; i < s.length; i++) r += '<span class="dv-cel ' + cls + '">' + s[i] + '</span>';
        r += '</div>';
        return r;
      }

      function filaGuion(inicio, hasta){
        let r = '<div class="dv-fila">';
        for (let i = 0; i < inicio; i++) r += celdaVacia();
        for (let i = inicio; i <= hasta; i++) r += '<span class="dv-cel dv-cel-dash">─</span>';
        r += '</div>';
        return r;
      }

      function filaProducto(numero, hasta){
        const s = String(numero);
        const signoPos = hasta - s.length;
        let r = '<div class="dv-fila">';
        for (let i = 0; i < signoPos; i++) r += celdaVacia();
        r += '<span class="dv-cel dv-cel-signo">−</span>';
        for (let i = 0; i < s.length; i++) r += '<span class="dv-cel dv-cel-prod">' + s[i] + '</span>';
        r += '</div>';
        return r;
      }

      function filaRestoCajasEdit(k, nCajas){
        const start = pasos[k].colEnd - nCajas + 1;
        let r = '<div class="dv-fila">';
        for (let i = 0; i < start; i++) r += celdaVacia();
        for (let i = 0; i < nCajas; i++) {
          r += '<input class="dv-r-cel" id="dv-r-' + k + '-' + i + '" data-step="' + k + '" data-idx="' + i + '" maxlength="1" inputmode="numeric" autocomplete="off">';
        }
        r += '</div>';
        return r;
      }

      function dashSpan(p, prodStr){
        const nemStart = p.colEnd - String(p.nem).length + 1;
        const prod = prodStr !== undefined ? prodStr : String(p.prod);
        return Math.min(nemStart, p.colEnd - prod.length);
      }

      function rend(){
        const L = dgs.length;
        let html = '<div class="dv-layout">';

        // título del paso actual
        html += '<div class="dv-fila dv-titulo"><span>' +
          (pasoActual < pasos.length
            ? 'Paso ' + (pasoActual + 1) + ' de ' + pasos.length + ' · Escribe la cifra del cociente y luego el resto en las casillas'
            : '🌟 ¡División completada!') +
          '</span></div>';

        // dos columnas: izquierda (dividendo + operaciones) y derecha (divisor/cociente)
        html += '<div class="dv-columnas">';

        // columna izquierda: dividendo y operaciones
        html += '<div class="dv-izquierda">';

        // dividendo
        html += '<div class="dv-fila">';
        dgs.forEach(function(d){
          html += '<span class="dv-cel dv-cel-dvd">' + d + '</span>';
        });
        html += '</div>';

        // pasos ya resueltos
        for (let k = 0; k < pasoActual; k++) {
          const p = pasos[k];
          html += filaNumero(p.nem, p.colEnd, '');
          html += filaNumero(p.typedResto, p.colEnd, 'dv-cel-rest');
        }

        // paso actual (en curso): solo el número y las cajas para el resto
        if (pasoActual < pasos.length) {
          const p = pasos[pasoActual];
          html += filaNumero(p.nem, p.colEnd, '');
          html += filaRestoCajasEdit(pasoActual, String(p.nem).length);
        }

        html += '</div>';

        // columna derecha: divisor / línea / cociente
        html += '<div class="dv-derecha">';

        // divisor (encima de la línea, sin caja)
        html += '<div class="dv-divisor">';
        String(divisor).split('').forEach(function(c){
          html += '<span class="dv-dig">' + c + '</span>';
        });
        html += '</div>';

        // línea horizontal
        html += '<div class="dv-linea"></div>';

        // cociente (debajo de la línea)
        html += '<div class="dv-cociente">';
        for (let k = 0; k < pasos.length; k++) {
          if (k < pasoActual) {
            html += '<span class="dv-cel dv-cel-q">' + pasos[k].typedQd + '</span>';
          } else if (k === pasoActual) {
            html += '<input class="dv-q" id="dv-q-' + k + '" data-step="' + k + '" maxlength="1" inputmode="numeric" autocomplete="off" value="' + (pasos[k].typedQd || '') + '">';
          } else {
            html += celdaVacia();
          }
        }
        html += '</div>';

        html += '</div>';
        html += '</div>';
        document.getElementById('dv-operacion').innerHTML = html;

        if (pasoActual < pasos.length) {
          const q = document.getElementById('dv-q-' + pasoActual);
          if (q) q.focus();
        }
      }

      function filaGuionPuntitos(inicio, hasta){
        let r = '<div class="dv-fila">';
        for (let i = 0; i < inicio; i++) r += celdaVacia();
        for (let i = inicio; i <= hasta; i++) r += '<span class="dv-cel dv-cel-dash">·</span>';
        r += '</div>';
        return r;
      }

      function comprobarPaso(){
        const k = pasoActual;
        const p = pasos[k];
        const qEl = document.getElementById('dv-q-' + k);
        if (!qEl) return;
        const qTxt = qEl.value.trim();
        if (qTxt === '') return;
        const qNum = parseInt(qTxt, 10);
        const inputs = document.querySelectorAll('#dv-operacion .dv-r-cel[data-step="' + k + '"]');
        let sResto = '';
        inputs.forEach(function(inp){ sResto += inp.value; });
        sResto = sResto.replace(/[^0-9]/g, '');
        const rNum = sResto === '' ? 0 : parseInt(sResto, 10);
        const exacto = qNum === p.qd && rNum === p.rem;
        const resultado = document.getElementById('dv-resultado');

        if (exacto) {
          p.typedQd = p.qd;
          p.typedResto = p.rem;
          pasoActual++;
          if (pasoActual === pasos.length) {
            const boton = document.getElementById('dv-paso');
            boton.textContent = '🏁 Comprobar división';
            resultado.textContent = '🥳 ¡Último paso! Pulsa «Comprobar división» para terminar.';
            resultado.className = 'dv-correcto';
          } else {
            resultado.textContent = '';
            resultado.className = '';
          }
          rend();
          if (pasoActual < pasos.length) {
            const q = document.getElementById('dv-q-' + pasoActual);
            if (q) q.focus();
          }
        } else {
          errores++;
          document.getElementById('dv-errores').textContent = errores;
          if (qEl) qEl.classList.add('dv-mal');
          inputs.forEach(function(inp){ inp.classList.add('dv-mal'); });
          resultado.className = 'dv-incorrecto';
          resultado.textContent = '❌ Vuelve a intentarlo. Aquí: ' + p.nem + ' ÷ ' + divisor +
            ' → cociente ' + p.qd + ' (×' + divisor + ' = ' + p.prod + ') y resto ' + p.rem + '.';
        }
      }

      function comprobarFinal(){
        if (pasoActual !== pasos.length || comprobado) return;
        const qStr = pasos.map(function(p){ return p.qd; }).join('');
        const bien = Number(qStr) === cociente && pasos[pasos.length - 1].rem === resto;
        const resultado = document.getElementById('dv-resultado');
        comprobado = true;
        document.getElementById('dv-paso').disabled = true;

        if (bien) {
          aciertos++;
          window.MatesCore.puntuar('dv', true);
          resultado.textContent = '✅ ¡Correcto! ' + separar(dividendo) + ' = ' + divisor + ' × ' + cociente + ' + ' + resto + '.';
          resultado.className = 'dv-correcto';
        } else {
          errores++;
          window.MatesCore.puntuar('dv', false);
          resultado.textContent = '❌ No coincide. El cociente es ' + cociente + ' y el resto ' + resto + '.';
          resultado.className = 'dv-incorrecto';
        }

        document.getElementById('dv-aciertos').textContent = aciertos;
        document.getElementById('dv-errores').textContent = errores;

        const historial = document.getElementById('dv-listaHistorial');
        const tuQ = pasos.map(function(p){ return p.typedQd || ''; }).join('');
        const ultimo = pasos[pasos.length - 1] || {};
        const tuR = ultimo.typedResto === undefined ? '?' : ultimo.typedResto;
        const tu = separar(dividendo) + ' ÷ ' + divisor + ' = ' + tuQ + ' r ' + tuR;
        const correcta = separar(dividendo) + ' ÷ ' + divisor + ' = ' + cociente + ' r ' + resto;
        const lineas = bien
          ? ['✅ ' + correcta + ' · Tú: ' + tuQ + ' r ' + tuR]
          : ['❌ Tú: ' + tu, '✔️ Correcto: ' + correcta];
        historial.prepend(window.MatesCore.itemHistorial(bien ? 'dv-correcto' : 'dv-incorrecto', lineas));

        setTimeout(generar, 3000);
      }

      function accion(){
        if (comprobado) return;
        if (pasoActual < pasos.length) comprobarPaso();
        else comprobarFinal();
      }

      document.getElementById('dv-operacion').addEventListener('input', function(e){
        const t = e.target;
        if (!t) return;
        if (t.classList.contains('dv-q')) {
          const k = parseInt(t.getAttribute('data-step'), 10);
          const v = t.value.replace(/\D/g, '').slice(0, 1);
          pasos[k].typedQd = v;
          if (t.value !== v) t.value = v;
          rend();
          if (v !== '') {
            const r0 = document.getElementById('dv-r-' + k + '-0');
            if (r0) r0.focus();
          }
        } else if (t.classList.contains('dv-r-cel')) {
          t.value = t.value.replace(/\D/g, '').slice(0, 1);
          const k = parseInt(t.getAttribute('data-step'), 10);
          const idx = parseInt(t.getAttribute('data-idx'), 10);
          const sig = document.getElementById('dv-r-' + k + '-' + (idx + 1));
          if (sig) sig.focus();
        }
      });

      document.getElementById('dv-operacion').addEventListener('keydown', function(e){
        if (e.key === 'Enter') { accion(); return; }
        const t = e.target;
        if (e.key === 'Backspace' && t && t.classList.contains('dv-r-cel') && t.value === '') {
          const k = parseInt(t.getAttribute('data-step'), 10);
          const idx = parseInt(t.getAttribute('data-idx'), 10);
          const prev = document.getElementById('dv-r-' + k + '-' + Math.max(0, idx - 1));
          if (prev) prev.focus();
        }
      });

      document.getElementById('dv-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('dv-paso').addEventListener('click', function(){ accion(); });
      document.getElementById('dv-dvdCifras').addEventListener('change', function(){ generar(); });
      document.getElementById('dv-dvsCifras').addEventListener('change', function(){ generar(); });
      generar();
    })();
  