
    (function(){
      let A = 0, B = 0;            // números como enteros escalados (sin la coma)
      let ea = 2, da = 0, eb = 1, db = 0;
      let decP = 0, intW = 0, C = 0, lb = 0;
      let aciertos = 0;
      let errores = 0;
      let comprobado = true;

      function aleatorioInt(min, max){ return min + Math.floor(Math.random() * (max - min + 1)); }
      function separar(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

      function formato(escalado, dec){
        const s = String(escalado);
        if (dec === 0) return separar(s);
        const ss = s.padStart(dec + 1, '0');
        const i = ss.slice(0, ss.length - dec);
        const f = ss.slice(ss.length - dec);
        return separar(i) + ',' + f;
      }

      function leerCifras(){
        ea = parseInt(document.getElementById('mu-ce-1').value, 10);
        da = parseInt(document.getElementById('mu-cd-1').value, 10);
        eb = parseInt(document.getElementById('mu-ce-2').value, 10);
        db = parseInt(document.getElementById('mu-cd-2').value, 10);
      }

      function celdaVacia(){ return '<span class="mul-cel"></span>'; }

      function cellsFromRight(builder){
        let s = '';
        for (let c = C - 1; c >= 0; c--) s += builder(c);
        return s;
      }

      // Coloca las cifras de un número (cad = entero escalado, dInt = nº de decimales)
      function cellsNumero(cad, dInt, cls){
        const L = cad.length;
        return cellsFromRight(function(c){
          if (c >= L) return celdaVacia();
          let inner = cad[L - 1 - c];
          if (dInt > 0 && c === dInt) inner += '<span class="mul-coma">,</span>';
          return '<span class="mul-cel ' + cls + '">' + inner + '</span>';
        });
      }

      // Fila de casillas (inputs) para un producto parcial: unidades en la columna jshift
      function cellsParcialInput(jshift, nCajas, ident){
        return cellsFromRight(function(c){
          const rel = c - jshift;
          if (rel >= 0 && rel < nCajas) {
            return '<input class="mul-caja" id="p-' + ident + '-' + rel + '" data-fila="' + ident + '" data-idx="' + rel + '" maxlength="1" inputmode="numeric" autocomplete="off">';
          }
          return celdaVacia();
        });
      }

      // Fila de casillas para la suma final (con la coma integrada)
      function cellsSumaInput(){
        return cellsFromRight(function(c){
          const inp = '<input class="mul-caja mul-caja-suma" id="sum-' + c + '" data-c="' + c + '" maxlength="1" inputmode="numeric" autocomplete="off">';
          if (decP > 0 && c === decP) return '<span class="mul-caja-wrap mul-con-coma">' + inp + '</span>';
          return inp;
        });
      }

      function fila(cells){ return '<div class="mul-fila">' + cells + '</div>'; }

      // Columna del operador (×) a la izquierda, igual en todas las filas para alinear
      function filaOp(cells, opTxt){
        return '<div class="mul-fila"><span class="mul-cel mul-op">' + opTxt + '</span>' + cells + '</div>';
      }

      function filaGuion(){
        let s = '<span class="mul-cel mul-cel-dash">─</span>';
        for (let c = C - 1; c >= 0; c--) s += '<span class="mul-cel mul-cel-dash">─</span>';
        return '<div class="mul-fila">' + s + '</div>';
      }

      function filasRellenables(){
        return Array.from(document.querySelectorAll('#mu-operacion .mul-fila')).filter(function(r){
          return r.querySelector('.mul-caja');
        });
      }
      function cajasFila(fila){ return Array.from(fila.querySelectorAll('.mul-caja')); }
      function ultimaCaja(fila){
        const cs = cajasFila(fila);
        return cs.length ? cs[cs.length - 1] : null;
      }
      function primeraCaja(actual){
        const filas = filasRellenables();
        for (let i = 0; i < filas.length; i++) {
          if (filas[i].contains(actual)) {
            const cs = cajasFila(filas[i]);
            const idx = cs.indexOf(actual);
            if (idx > 0) return cs[idx - 1];
            return filas[i + 1] ? ultimaCaja(filas[i + 1]) : null;
          }
        }
        return null;
      }
      function cajaAnterior(actual){
        const filas = filasRellenables();
        for (let i = 0; i < filas.length; i++) {
          if (filas[i].contains(actual)) {
            const cs = cajasFila(filas[i]);
            const idx = cs.indexOf(actual);
            if (idx < cs.length - 1) return cs[idx + 1];
            return i > 0 ? ultimaCaja(filas[i - 1]) : null;
          }
        }
        return null;
      }

      function rend(){
        const SA = String(A);
        const SB = String(B);
        const esSimple = lb === 1;
        let html = '<div class="mul-wrap">';

        html += '<div class="mul-fila mul-titulo"><span>' + (esSimple ? 'Escribe el resultado' : 'Escribe cada producto en su fila y después la suma final') + '</span></div>';

        html += filaOp(cellsNumero(SA, da, 'mul-cel-num'), '');
        html += filaOp(cellsNumero(SB, db, 'mul-cel-num'), '×');
        html += filaGuion();

        if (esSimple) {
          html += filaOp(cellsSumaInput(), '');
        } else {
          for (let j = 0; j < lb; j++) {
            const digit = parseInt(SB[lb - 1 - j], 10);
            const nCajas = String(A * digit).length;
            html += filaOp(cellsParcialInput(j, nCajas, j), '');
          }
          html += filaGuion();
          html += filaOp(cellsSumaInput(), '');
        }
        html += '</div>';

        document.getElementById('mu-operacion').innerHTML = html;
      }

      function generar(){
        leerCifras();
        const la = ea + da;
        const lbb = eb + db;
        A = aleatorioInt(Math.pow(10, la - 1), Math.pow(10, la) - 1);
        B = aleatorioInt(Math.pow(10, lbb - 1), Math.pow(10, lbb) - 1);
        decP = da + db;
        lb = String(B).length;
        intW = ea + eb;
        C = intW + decP;
        comprobado = false;

        document.getElementById('mu-resultado').textContent = '';
        document.getElementById('mu-resultado').className = '';
        document.getElementById('mu-comprobar').disabled = false;
        rend();
        const filas = filasRellenables();
        const primero = filas.length ? ultimaCaja(filas[0]) : null;
        if (primero) primero.focus();
      }

      function leerFila(ident){
        const inputs = document.querySelectorAll('#mu-operacion .mul-caja[data-fila="' + ident + '"]');
        let s = '';
        inputs.forEach(function(inp){ s += inp.value; });
        s = s.replace(/[^0-9]/g, '');
        return s === '' ? 0 : parseInt(s, 10);
      }

      function leerSuma(){
        const inputs = document.querySelectorAll('#mu-operacion .mul-caja-suma');
        let intStr = '', decStr = '';
        inputs.forEach(function(inp){
          const c = parseInt(inp.getAttribute('data-c'), 10);
          const v = (inp.value || '').replace(/[^0-9]/g, '');
          if (decP > 0 && c < decP) decStr += v;
          else intStr += v;
        });
        const intN = intStr === '' ? 0 : parseInt(intStr, 10);
        const decN = decStr === '' ? 0 : parseInt(decStr, 10);
        return intN * Math.pow(10, decP) + decN;
      }

      function comprobar(){
        if (comprobado) return;
        const resultado = document.getElementById('mu-resultado');
        let todoBien = true;

        for (let j = 0; j < lb && lb > 1; j++) {
          const digit = parseInt(String(B)[lb - 1 - j], 10);
          const esperado = A * digit;
          const obtenido = leerFila(j);
          const cajas = document.querySelectorAll('#mu-operacion .mul-caja[data-fila="' + j + '"]');
          if (obtenido === esperado) {
            cajas.forEach(function(c){ if (c.value !== '') c.classList.add('mul-bien'); });
          } else {
            todoBien = false;
            cajas.forEach(function(c){ c.classList.remove('mul-bien'); c.classList.add('mul-mal'); });
          }
        }

        const sumaObtenida = leerSuma();
        const sumaEsperada = A * B;
        const cajasSuma = document.querySelectorAll('#mu-operacion .mul-caja-suma');
        if (sumaObtenida === sumaEsperada) {
          cajasSuma.forEach(function(c){ if (c.value !== '') c.classList.add('mul-bien'); });
        } else {
          todoBien = false;
          cajasSuma.forEach(function(c){ c.classList.remove('mul-bien'); c.classList.add('mul-mal'); });
        }

        comprobado = true;
        document.getElementById('mu-comprobar').disabled = true;

        const aTxt = formato(A, da);
        const bTxt = formato(B, db);
        const pTxt = formato(A * B, decP);

        if (todoBien) {
          aciertos++;
          window.MatesCore.puntuar('mu', true);
          resultado.textContent = '✅ ¡Correcto! ' + aTxt + ' × ' + bTxt + ' = ' + pTxt + '.';
          resultado.className = 'mu-correcto';
        } else {
          errores++;
          window.MatesCore.puntuar('mu', false);
          resultado.textContent = '❌ Revisa las casillas en rojo. ' + aTxt + ' × ' + bTxt + ' = ' + pTxt + '.';
          resultado.className = 'mu-incorrecto';
        }

        document.getElementById('mu-aciertos').textContent = aciertos;
        document.getElementById('mu-errores').textContent = errores;

        const historial = document.getElementById('mu-listaHistorial');
        const li = document.createElement('li');
        li.className = todoBien ? 'mu-correcto' : 'mu-incorrecto';
        li.textContent = aTxt + ' × ' + bTxt + ' = ' + pTxt + (todoBien ? ' ✅' : '');
        historial.prepend(li);

        if (todoBien) setTimeout(generar, 3000);
      }

      document.getElementById('mu-operacion').addEventListener('input', function(e){
        const t = e.target;
        if (t && t.classList.contains('mul-caja')) {
          t.value = t.value.replace(/\D/g, '').slice(0, 1);
          t.classList.remove('mul-mal', 'mul-bien');
          if (t.value !== '') {
            const sig = primeraCaja(t);
            if (sig) sig.focus();
            else {
              const comp = document.getElementById('mu-comprobar');
              if (comp) comp.focus();
            }
          }
        }
      });

      document.getElementById('mu-operacion').addEventListener('keydown', function(e){
        if (e.key === 'Enter') comprobar();
        const t = e.target;
        if (e.key === 'Backspace' && t && t.classList.contains('mul-caja') && t.value === '') {
          const ant = cajaAnterior(t);
          if (ant) {
            e.preventDefault();
            ant.focus();
          }
        }
      });

      document.getElementById('mu-generar').addEventListener('click', generar);
      document.getElementById('mu-comprobar').addEventListener('click', comprobar);
      document.getElementById('mu-ce-1').addEventListener('change', generar);
      document.getElementById('mu-cd-1').addEventListener('change', generar);
      document.getElementById('mu-ce-2').addEventListener('change', generar);
      document.getElementById('mu-cd-2').addEventListener('change', generar);

      generar();
    })();
