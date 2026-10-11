
    (function(){
      let operacion = '';
      let numeros = [];          // valores escalados (en unidades de 10^-maxDec)
      let numerosDisplay = [];   // cadenas formateadas para mostrar e historial
      let maxDec = 0;            // columnas decimales comunes de la operación actual
      let M = 1;                 // 10^maxDec
      let totalAciertos = 0;
      let totalErrores = 0;

      function mostrarSumas(){ return document.getElementById('tab-sumas').classList.contains('active'); }

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && mostrarSumas()) {
          sy_verificar();
        }
      });

      function aleatorio(min, max){ return min + Math.floor(Math.random() * (max - min + 1)); }

      function opcionesEnteras() {
        let h = '';
        for (let c = 1; c <= 6; c++) {
          h += `<option value="${c}">${c} cifra${c > 1 ? 's' : ''} entera${c > 1 ? 's' : ''}</option>`;
        }
        return h;
      }

      function opcionesDecimales() {
        let h = '';
        for (let c = 0; c <= 3; c++) {
          h += `<option value="${c}">${c} decimale${c === 1 ? '' : 's'}</option>`;
        }
        return h;
      }

      // Genera un número con `ei` cifras enteras y `ed` decimales, devuelto escalado
      // a unidades de 10^-maxDec (columna decimal común de la operación).
      function genNumero(ei, ed, minEsc) {
        const step = Math.pow(10, maxDec - ed);
        const intMin = ei === 1 ? 1 : Math.pow(10, ei - 1);
        const intMax = Math.pow(10, ei) - 1;
        const kMax = Math.pow(10, ed) - 1;
        for (let intento = 0; intento < 300; intento++) {
          const int = aleatorio(intMin, intMax);
          const k = ed > 0 ? aleatorio(0, kMax) : 0;
          const v = int * M + k * step;
          if (minEsc !== undefined && v < minEsc) continue;
          return v;
        }
        let int = intMax;
        let v = int * M;
        if (minEsc !== undefined && v < minEsc) {
          v = v + Math.ceil((minEsc - v) / step) * step;
        }
        return v;
      }

      function renderizarSelectoCifras() {
        const op = document.getElementById('sy-tipo').value;
        const vecesBox = document.getElementById('sy-vecesBox');
        const cont = document.getElementById('sy-cifraSelects');
        cont.innerHTML = '';
        if (!op || op === '') {
          vecesBox.style.display = 'none';
          return;
        }
        vecesBox.style.display = 'block';
        document.getElementById('sy-vecesLab').textContent = '¿Cuántos números vas a ' + (op === 'suma' ? 'sumar' : 'restar') + '?';
        const veces = parseInt(document.getElementById('sy-veces').value, 10);
        for (let i = 1; i <= veces; i++) {
          const lab = document.createElement('span');
          lab.textContent = 'Número ' + i + ': ';
          cont.appendChild(lab);
          const eSel = document.createElement('select');
          eSel.id = 'sy-ce-' + i;
          eSel.className = 'sy-cifra';
          eSel.innerHTML = opcionesEnteras();
          eSel.value = '2';
          cont.appendChild(eSel);
          cont.appendChild(document.createTextNode(' enteras, '));
          const dSel = document.createElement('select');
          dSel.id = 'sy-cd-' + i;
          dSel.className = 'sy-cifra';
          dSel.innerHTML = opcionesDecimales();
          dSel.value = '0';
          cont.appendChild(dSel);
          cont.appendChild(document.createTextNode(' decimales'));
          cont.appendChild(document.createElement('br'));
        }
      }

      window.sy_generarPregunta = function() {
        operacion = document.getElementById('sy-tipo').value;
        if (operacion === '') {
          document.getElementById('sy-resultado').textContent = '⚠️ Elige primero «Suma» o «Resta».';
          document.getElementById('sy-resultado').className = 'sy-incorrecto';
          return;
        }

        const veces = parseInt(document.getElementById('sy-veces').value, 10);
        const eis = [], eds = [];
        for (let i = 1; i <= veces; i++) {
          eis.push(parseInt(document.getElementById('sy-ce-' + i).value, 10));
          eds.push(parseInt(document.getElementById('sy-cd-' + i).value, 10));
        }
        maxDec = Math.max.apply(null, eds);
        M = Math.pow(10, maxDec);

        numeros = [];
        for (let i = 1; i < veces; i++) numeros.push(genNumero(eis[i], eds[i]));

        if (operacion === 'suma') {
          numeros.unshift(genNumero(eis[0], eds[0]));
        } else {
          const S = numeros.reduce(function(a, b){ return a + b; }, 0);
          const step0 = Math.pow(10, maxDec - eds[0]);
          const minEsc = Math.ceil(S / step0) * step0;
          let ei0 = eis[0];
          const hi = function(ei){
            return (Math.pow(10, ei) - 1) * M + (Math.pow(10, eds[0]) - 1) * step0;
          };
          while (hi(ei0) < minEsc) ei0++;
          numeros.unshift(genNumero(ei0, eds[0], minEsc));
        }

        const simbolo = operacion === 'suma' ? '+' : '−';
        numerosDisplay = numeros.map(function(v){
          const int = Math.floor(v / M);
          const dec = String(v % M).padStart(maxDec, '0');
          return String(int) + (maxDec > 0 ? ',' + dec : '');
        });
        const maxInt = Math.max.apply(null, numeros.map(function(v){ return String(Math.floor(v / M)).length; }));
        const lineas = numerosDisplay.map(function(s, i){
          const pos = s.indexOf(',');
          const ent = pos === -1 ? s : s.slice(0, pos);
          const dec = pos === -1 ? '' : s.slice(pos + 1);
          return (i === 0 ? ' ' : simbolo) + ent.padStart(maxInt, ' ') + (maxDec > 0 ? ',' + dec : '');
        }).join('\n');
        const separador = '─'.repeat(maxInt + 1 + maxDec);

        document.getElementById('sy-operacion').innerHTML = `\n<pre>\n${lineas}\n${separador}\n</pre>`;
        document.getElementById('sy-resultado').textContent = '';
        document.getElementById('sy-resultado').className = '';

        sy_generarInputsRespuesta();
      };

      function resultadoCorrecto() {
        const res = operacion === 'suma'
          ? numeros.reduce(function(acc, n){ return acc + n; }, 0)
          : numeros[0] - numeros.slice(1).reduce(function(acc, n){ return acc + n; }, 0);
        return { int: Math.floor(res / M), dec: Math.abs(res % M), res: res };
      }

      function formatearRes(r) {
        return String(r.int) + (maxDec > 0 ? ',' + String(r.dec).padStart(maxDec, '0') : '');
      }

      function crearInputCaja(container, conClaseDec) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.size = 1;
        input.style.width = '2rem';
        input.style.fontSize = '1.5rem';
        input.style.textAlign = 'center';
        input.inputMode = 'numeric';
        input.autocomplete = 'off';
        if (conClaseDec) input.className = 'sy-dec';
        container.appendChild(input);
        return input;
      }

      function sy_generarInputsRespuesta() {
        const container = document.getElementById('sy-respuestaContainer');
        container.innerHTML = '';
        const r = resultadoCorrecto();
        const intLen = Math.max(1, String(r.int).length);
        const inputs = [];

        for (let i = 0; i < intLen; i++) inputs.push(crearInputCaja(container, false));

        if (maxDec > 0) {
          const coma = document.createElement('span');
          coma.textContent = ',';
          coma.style.fontSize = '1.5rem';
          coma.style.padding = '0 2px';
          container.appendChild(coma);
          for (let i = 0; i < maxDec; i++) inputs.push(crearInputCaja(container, true));
        }

        inputs[inputs.length - 1].focus();

        inputs.forEach((input, index) => {
          input.addEventListener('input', () => {
            if (input.value !== '' && index > 0) {
              inputs[index - 1].focus();
            }
          });
        });
      }

      window.sy_verificar = function() {
        const inputs = Array.prototype.slice.call(document.querySelectorAll('#sy-respuestaContainer input'));
        const intInputs = inputs.filter(i => !i.classList.contains('sy-dec'));
        const decInputs = inputs.filter(i => i.classList.contains('sy-dec'));

        let intTxt = '';
        intInputs.forEach(i => intTxt += i.value.trim());

        let decScaled = 0;
        if (decInputs.length > 0) {
          decInputs.forEach(function(inp, j){
            if (inp.value.trim() !== '') {
              decScaled += parseInt(inp.value, 10) * Math.pow(10, decInputs.length - 1 - j);
            }
          });
        }

        if (intTxt === '' && decScaled === 0) return;

        const numUsuario = (intTxt === '' ? 0 : parseInt(intTxt, 10)) * M + decScaled;
        const r = resultadoCorrecto();
        const correctoMostrar = formatearRes(r);
        const resultado = document.getElementById('sy-resultado');
        const simbolo = operacion === 'suma' ? '+' : '−';

        const esCorrecto = numUsuario === r.res;

        window.MatesCore.puntuar('sy', esCorrecto);

        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto!';
          resultado.className = 'sy-correcto';
          totalAciertos++;
        } else {
          resultado.textContent = '❌ Incorrecto. La respuesta era ' + correctoMostrar + '.';
          resultado.className = 'sy-incorrecto';
          totalErrores++;
        }

        document.getElementById('sy-aciertos').textContent = totalAciertos;
        document.getElementById('sy-errores').textContent = totalErrores;

        const historial = document.getElementById('sy-listaHistorial');
        const li = document.createElement('li');
        li.className = esCorrecto ? 'sy-correcto' : 'sy-incorrecto';
        const expresion = numerosDisplay.join(' ' + simbolo + ' ');
        const usr = formatearRes({ int: Math.floor(numUsuario / M), dec: Math.abs(numUsuario % M) });
        li.textContent = expresion + ' = ' + usr + ' ' + (esCorrecto ? '✅' : '❌ (correcto: ' + correctoMostrar + ')');
        historial.prepend(li);

        setTimeout(sy_generarPregunta, 2000);
      };

      document.getElementById('sy-tipo').addEventListener('change', function(){ renderizarSelectoCifras(); });
      document.getElementById('sy-veces').addEventListener('change', function(){ renderizarSelectoCifras(); });
      renderizarSelectoCifras();
    })();
  