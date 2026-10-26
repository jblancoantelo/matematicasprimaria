
    (function(){
      const PROPIEDADES = {
        conmutativa: {
          nombre: 'Conmutativa',
          emoji: '🔵'
        },
        asociativa: {
          nombre: 'Asociativa',
          emoji: '🟢'
        },
        distributiva: {
          nombre: 'Distributiva',
          emoji: '🟣'
        }
      };

      const REGLA_CONMUTATIVA = {
        '×': { regla: 'El orden de los factores no cambia el producto.', formula: 'a × b = b × a' },
        '+': { regla: 'El orden de los sumandos no cambia la suma.', formula: 'a + b = b + a' }
      };
      const REGLA_ASOCIATIVA = {
        '×': { regla: 'Al multiplicar tres números, da igual cómo los agrupemos.', formula: '(a × b) × c = a × (b × c)' },
        '+': { regla: 'Al sumar tres números, da igual cómo los agrupemos.', formula: '(a + b) + c = a + (b + c)' }
      };
      const REGLA_DISTRIBUTIVA = {
        regla: 'Multiplicar un número por una suma es multiplicar ese número por cada sumando y después sumar los resultados.',
        formula: 'a × (b + c) = (a × b) + (a × c)',
        ejemplo: '1 × (2 + 3) = (1 × 2) + (1 × 3) = 2 + 3 = 5'
      };

      let actual = null;
      let aciertos = 0;
      let errores = 0;

      function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
      function el(id){ return document.getElementById(id); }

      function campo(i, etiqueta, clase){
        return '<input class="pm-hueco' + (clase ? ' ' + clase : '') +
          '" data-i="' + i + '" type="text" inputmode="numeric" autocomplete="off" ' +
          'spellcheck="false" aria-label="' + (etiqueta || 'Número') + '">';
      }

      /* ---------- Generadores de preguntas ---------- */

      function genConmutativa(op){
        const suma = op === '+';
        const min = suma ? 3 : 2;
        const max = suma ? 25 : 12;

        let a = randInt(min, max);
        let b = randInt(min, max);
        while (b === a) b = randInt(min, max);

        const regla = REGLA_CONMUTATIVA[op];

        return {
          prop: 'conmutativa',
          modo: 'huecos',
          op: op,
          expr: a + ' ' + op + ' ' + b + ' = ' + campo(0, 'Primer número') + ' ' + op + ' ' + campo(1, 'Segundo número'),
          texto: a + ' ' + op + ' ' + b + ' = [ ] ' + op + ' [ ]',
          esperados: [b, a],
          completa: a + ' ' + op + ' ' + b + ' = ' + b + ' ' + op + ' ' + a,
          resultado: suma ? a + b : a * b,
          regla: regla.regla,
          formula: regla.formula,
          pista: 'Escribe los mismos números en el otro orden.'
        };
      }

      function genAsociativa(op){
        const suma = op === '+';
        const max = suma ? 20 : 9;

        const a = randInt(2, max);
        const b = randInt(2, max);
        const c = randInt(2, max);
        const regla = REGLA_ASOCIATIVA[op];

        return {
          prop: 'asociativa',
          modo: 'grupos',
          op: op,
          nums: [a, b, c],
          completa: '(' + a + ' ' + op + ' ' + b + ') ' + op + ' ' + c +
            ' = ' + a + ' ' + op + ' (' + b + ' ' + op + ' ' + c + ')',
          resultado: suma ? a + b + c : a * b * c,
          regla: regla.regla,
          formula: regla.formula,
          pista: 'Los paréntesis dicen qué dos números se ' + (suma ? 'suman' : 'multiplican') +
            ' primero. Cambia la agrupación sin cambiar el orden y comprueba que el resultado no cambia.'
        };
      }

      function genDistributiva(){
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        const c = randInt(2, 9);

        const izquierda = a + ' × (' + b + ' + ' + c + ')';
        const op2 = '+';
        const esperados = [a, b, a, c];

        const terminos = [esperados[0] * esperados[1], esperados[2] * esperados[3]];
        const resultado = terminos[0] + terminos[1];

        return {
          prop: 'distributiva',
          modo: 'dist',
          paso: 1,
          izquierda: izquierda,
          op2: op2,
          esperados: esperados,
          opsEsperadas: ['×', '+', '×'],
          opsEsperadasPaso2: [op2],
          terminos: terminos,
          esperadosPaso2: [terminos[0], terminos[1], resultado],
          completa: izquierda + ' = (' + esperados[0] + ' × ' + esperados[1] + ') ' + op2 +
            ' (' + esperados[2] + ' × ' + esperados[3] + ')',
          resultado: resultado,
          regla: REGLA_DISTRIBUTIVA.regla,
          formula: REGLA_DISTRIBUTIVA.formula,
          ejemplo: REGLA_DISTRIBUTIVA.ejemplo,
          pista: 'Multiplica el número de fuera por cada número del paréntesis. Elige tú la operación' +
            ' de cada hueco y coloca los paréntesis si quieres.'
        };
      }

      /* ---------- Interfaz ---------- */

      function mostrarAyuda(mostrar){
        el('pm-ayuda').hidden = !mostrar;
        const btn = el('pm-pista');
        btn.textContent = mostrar ? '🙈 Ocultar pista' : '💡 Ver pista';
        btn.setAttribute('aria-expanded', mostrar ? 'true' : 'false');
      }

      function limpiarResultado(){
        const r = el('pm-resultado');
        if (!r) return;
        r.textContent = '';
        r.className = 'pm-resultado';
      }

      function mostrarAviso(texto){
        const r = el('pm-resultado');
        r.textContent = texto;
        r.className = 'pm-resultado pm-aviso';
      }

      function agregarHistorial(lineas, correcto){
        const lista = el('pm-listaHistorial');
        const li = window.MatesCore.itemHistorial(correcto ? 'pm-ok' : 'pm-ko', lineas);
        if (!correcto && lineas.length > 1) {
          li.lastElementChild.classList.add('pm-hist-bien');
        }
        lista.prepend(li);
        while (lista.children.length > 50) lista.removeChild(lista.lastChild);
      }

      function actualizarContadores(){
        el('pm-aciertos').textContent = aciertos;
        el('pm-errores').textContent = errores;
      }

      function textoConValores(texto, valores){
        let i = 0;
        return texto.replace(/\[\s*\]/g, function(){
          const valor = valores[i++];
          return valor === undefined || valor === '' ? '?' : valor;
        });
      }

      /* ---------- Constructor de la propiedad asociativa ---------- */

      function cadenaGrupoHTML(datos, agrupa, vals){
        const textos = vals || ['', '', ''];
        const op = '<span class="pm-signo">' + datos.op + '</span>';
        function inp(i){
          return '<input class="pm-hueco pm-num" data-i="' + i + '" type="text" inputmode="numeric" ' +
            'autocomplete="off" spellcheck="false" value="' + (textos[i] || '') + '" ' +
            'aria-label="Número ' + (i + 1) + '">';
        }
        if (agrupa === 'a') {
          return '<span class="pm-par">(</span>' + inp(0) + ' ' + op + ' ' + inp(1) +
            '<span class="pm-par">)</span> ' + op + ' ' + inp(2);
        }
        if (agrupa === 'b') {
          return inp(0) + ' ' + op + ' <span class="pm-par">(</span>' + inp(1) + ' ' +
            op + ' ' + inp(2) + '<span class="pm-par">)</span>';
        }
        return inp(0) + ' ' + op + ' ' + inp(1) + ' ' + op + ' ' + inp(2);
      }

      function renderGrupos(datos){
        let html = '<div class="pm-objetivo">Usa estos números: <strong>' +
          datos.nums.join(' · ') + '</strong></div>';

        [0, 1].forEach(function(i){
          html +=
            '<div class="pm-forma">' +
              '<div class="pm-forma-titulo">' + (i === 0 ? 'Primera forma' : 'Segunda forma') + '</div>' +
              '<div class="pm-cadena" data-forma="' + i + '" data-agrupa="">' +
                cadenaGrupoHTML(datos, '', null) +
              '</div>' +
              '<div class="pm-agrupa">' +
                '<button class="pm-agrupa-btn" type="button" data-forma="' + i +
                  '" data-agrupa="a" aria-pressed="false">( ① ' + datos.op + ' ② ) ' + datos.op + ' ③</button>' +
                '<button class="pm-agrupa-btn" type="button" data-forma="' + i +
                  '" data-agrupa="b" aria-pressed="false">① ' + datos.op + ' ( ② ' + datos.op + ' ③ )</button>' +
              '</div>' +
            '</div>';
        });

        el('pm-builder').innerHTML = html;
      }

      function filaGrupoTexto(fila, datos){
        const v = fila.vals.map(function(x){ return x === '' ? '?' : x; });
        const op = ' ' + datos.op + ' ';
        if (fila.agrupa === 'a') return '(' + v[0] + op + v[1] + ')' + op + v[2];
        if (fila.agrupa === 'b') return v[0] + op + '(' + v[1] + op + v[2] + ')';
        return v[0] + op + v[1] + op + v[2];
      }

      function expresionGrupos(filas, datos){
        return filaGrupoTexto(filas[0], datos) + ' = ' + filaGrupoTexto(filas[1], datos);
      }

      /* ---------- Constructor de la propiedad distributiva ---------- */

      function opBoton(etiqueta){
        return '<button class="pm-op" type="button" data-op-valor="" aria-label="' +
          etiqueta + ' (pulsa para cambiar entre × y +)">?</button>';
      }

      function renderDist(datos){
        el('pm-builder').innerHTML =
          '<div class="pm-objetivo pm-dist-izq">' + datos.izquierda +
            ' <span class="pm-igual">=</span></div>' +
          '<div class="pm-forma">' +
            '<div class="pm-cadena pm-dist-cadena" data-paso="1">' +
              '<span class="pm-producto" data-par="0">' +
                '<span class="pm-par">(</span>' + campo(0, 'Número 1', 'pm-num') +
                  opBoton('Operación entre el primer y el segundo número') +
                  campo(1, 'Número 2', 'pm-num') +
                  '<span class="pm-par">)</span>' +
              '</span>' +
              opBoton('Operación entre los dos productos') +
              '<span class="pm-producto" data-par="0">' +
                '<span class="pm-par">(</span>' + campo(2, 'Número 3', 'pm-num') +
                  opBoton('Operación entre el tercer y el cuarto número') +
                  campo(3, 'Número 4', 'pm-num') +
                  '<span class="pm-par">)</span>' +
              '</span>' +
            '</div>' +
            '<div class="pm-agrupa">' +
              '<button class="pm-agrupa-btn" type="button" data-grupo="0" aria-pressed="false">( ) Paréntesis 1.º</button>' +
              '<button class="pm-agrupa-btn" type="button" data-grupo="1" aria-pressed="false">( ) Paréntesis 2.º</button>' +
            '</div>' +
          '</div>' +
          '<div class="pm-forma pm-dist-paso2" hidden>' +
            '<div class="pm-forma-titulo">Ahora calcula</div>' +
            '<div class="pm-cadena pm-dist-cadena" data-paso="2">' +
              '<span class="pm-igual">=</span> ' + campo(4, 'Primer producto', 'pm-num') +
              opBoton('Operación entre los dos productos') + campo(5, 'Segundo producto', 'pm-num') +
              ' <span class="pm-igual">=</span> ' + campo(6, 'Resultado', 'pm-num') +
            '</div>' +
          '</div>';
      }

      function textoDist(datos, vals, pares, ops){
        const v = vals.map(function(x){ return x === '' ? '?' : x; });
        const o = (ops || []).map(function(x){ return x || '?'; });
        while (o.length < 3) o.push('?');
        const con1 = pares && pares[0];
        const con2 = pares && pares[1];
        const p1 = (con1 ? '(' : '') + v[0] + ' ' + o[0] + ' ' + v[1] + (con1 ? ')' : '');
        const p2 = (con2 ? '(' : '') + v[2] + ' ' + o[2] + ' ' + v[3] + (con2 ? ')' : '');
        return datos.izquierda + ' = ' + p1 + ' ' + o[1] + ' ' + p2;
      }

      function parentesisDist(){
        const grupos = el('pm-builder').querySelectorAll('.pm-producto');
        return Array.prototype.map.call(grupos, function(g){
          return g.getAttribute('data-par') === '1';
        });
      }

      /* ---------- Generar pregunta ---------- */

      function generar(){
        const seleccion = el('pm-tipo').value;
        const prop = seleccion === 'mezcla'
          ? ['conmutativa', 'asociativa', 'distributiva'][randInt(0, 2)]
          : seleccion;
        const op = randInt(0, 1) === 1 ? '+' : '×';

        let datos;
        if (prop === 'conmutativa') datos = genConmutativa(op);
        else if (prop === 'asociativa') datos = genAsociativa(op);
        else datos = genDistributiva();

        actual = datos;
        const info = PROPIEDADES[datos.prop];

        el('pm-tarjeta').setAttribute('data-prop', datos.prop);
        el('pm-etiqueta').textContent = info.emoji + ' Propiedad ' + info.nombre.toLowerCase() +
          (datos.op === '+' ? ' de la suma' : '');

        limpiarResultado();

        const operacion = el('pm-operacion');
        const builder = el('pm-builder');

        if (datos.modo === 'huecos') {
          operacion.hidden = false;
          builder.hidden = true;
          builder.innerHTML = '';
          el('pm-consigna').textContent = 'Escribe los dos números que faltan.';
          operacion.innerHTML = datos.expr;
        } else if (datos.modo === 'grupos') {
          operacion.hidden = true;
          operacion.innerHTML = '';
          builder.hidden = false;
          el('pm-consigna').textContent = 'Escribe los tres números y elige dónde van los paréntesis en cada forma.';
          renderGrupos(datos);
        } else {
          operacion.hidden = true;
          operacion.innerHTML = '';
          builder.hidden = false;
          el('pm-consigna').textContent =
            'Aplica la propiedad distributiva: escribe los números, elige × o + y coloca los paréntesis.';
          renderDist(datos);
        }

        el('pm-ayuda').innerHTML =
          '<strong>Propiedad ' + info.nombre.toLowerCase() + ':</strong> ' + datos.regla +
          '<br><span class="pm-formula">' + datos.formula + '</span>' +
          (datos.ejemplo ? '<br><span class="pm-formula">Ejemplo: ' + datos.ejemplo + '</span>' : '') +
          '<br>' + datos.pista;
        mostrarAyuda(false);

        const primer = builder.hidden
          ? operacion.querySelector('.pm-hueco')
          : builder.querySelector('.pm-hueco');
        if (primer) {
          try { primer.focus({ preventScroll: true }); } catch (e) { primer.focus(); }
        }
      }

      /* ---------- Comprobar ---------- */

      function comprobarHuecos(){
        const inputs = Array.prototype.slice.call(el('pm-operacion').querySelectorAll('.pm-hueco'));
        const vals = inputs.map(function(i){ return i.value.trim(); });

        if (vals.some(function(v){ return v === ''; })) {
          const vacio = inputs[vals.indexOf('')];
          if (vacio) vacio.focus();
          mostrarAviso('Escribe los dos números.');
          return;
        }

        const nums = vals.map(function(v){ return Number(v.replace(',', '.')); });
        const ok = nums.every(function(n, i){
          return Number.isFinite(n) && n === actual.esperados[i];
        });
        const tu = textoConValores(actual.texto, vals);
        const correcta = actual.completa + ' = ' + actual.resultado;

        if (ok) {
          inputs.forEach(function(i){ i.classList.add('pm-bien'); });
          aciertos++;
          window.MatesCore.puntuar('pm', true);
          agregarHistorial(['✅ ' + tu + ' = ' + actual.resultado], true);
          actualizarContadores();
          generar();
        } else {
          inputs.forEach(function(inp, i){
            inp.classList.toggle('pm-mal', nums[i] !== actual.esperados[i]);
          });
          errores++;
          window.MatesCore.puntuar('pm', false);
          agregarHistorial(['❌ Tú: ' + tu, '✔️ Correcto: ' + correcta], false);
          actualizarContadores();

          const r = el('pm-resultado');
          r.textContent = '❌ No es correcto. Revisa los números y vuelve a intentarlo.';
          r.className = 'pm-resultado pm-ko';

          const primerMal = inputs.filter(function(inp, i){ return nums[i] !== actual.esperados[i]; })[0];
          if (primerMal) { primerMal.focus(); primerMal.select(); }
        }
      }

      function comprobarGrupos(){
        const cadenas = Array.prototype.slice.call(el('pm-builder').querySelectorAll('.pm-cadena'));
        const filas = cadenas.map(function(cadena){
          const inputs = Array.prototype.slice.call(cadena.querySelectorAll('.pm-hueco'));
          return {
            cadena: cadena,
            inputs: inputs,
            vals: inputs.map(function(i){ return i.value.trim(); }),
            agrupa: cadena.getAttribute('data-agrupa') || ''
          };
        });

        for (let i = 0; i < filas.length; i++) {
          if (filas[i].vals.some(function(v){ return v === ''; })) {
            const vacio = filas[i].inputs.filter(function(inp){ return inp.value.trim() === ''; })[0];
            if (vacio) vacio.focus();
            mostrarAviso('Escribe los tres números en las dos formas.');
            return;
          }
          if (!filas[i].agrupa) {
            mostrarAviso('Elige dónde van los paréntesis en cada forma.');
            return;
          }
        }

        const n0 = filas[0].vals.map(Number);
        const n1 = filas[1].vals.map(Number);
        const objetivo = actual.nums.slice().sort(function(x, y){ return x - y; }).join(',');
        const usados0 = n0.slice().sort(function(x, y){ return x - y; }).join(',');
        const usados1 = n1.slice().sort(function(x, y){ return x - y; }).join(',');

        const tu = expresionGrupos(filas, actual);

        if (usados0 !== objetivo || usados1 !== objetivo) {
          filas.forEach(function(fila){
            fila.inputs.forEach(function(inp){ inp.classList.add('pm-mal'); });
          });
          fallarGrupos('Usa los números ' + actual.nums.join(', ') + ' en las dos formas.', tu);
          return;
        }
        if (n0.join(',') !== n1.join(',')) {
          fallarGrupos('Escribe los mismos números en el mismo orden en las dos formas.', tu);
          return;
        }
        if (filas[0].agrupa === filas[1].agrupa) {
          fallarGrupos('Cambia la agrupación: las dos formas no pueden tener los mismos paréntesis.', tu);
          return;
        }

        filas.forEach(function(fila){
          fila.inputs.forEach(function(inp){ inp.classList.add('pm-bien'); });
        });
        aciertos++;
        window.MatesCore.puntuar('pm', true);
        agregarHistorial(['✅ ' + tu + ' = ' + actual.resultado], true);
        actualizarContadores();
        generar();
      }

      function fallarGrupos(mensaje, tu){
        const r = el('pm-resultado');
        r.textContent = '❌ ' + mensaje;
        r.className = 'pm-resultado pm-ko';

        errores++;
        window.MatesCore.puntuar('pm', false);
        agregarHistorial([
          '❌ Tú: ' + tu,
          '✔️ Correcto: ' + actual.completa + ' = ' + actual.resultado
        ], false);
        actualizarContadores();
      }

      function distCadena(paso){
        return el('pm-builder').querySelector('.pm-dist-cadena[data-paso="' + paso + '"]');
      }

      function distValores(paso){
        return Array.prototype.slice
          .call(distCadena(paso).querySelectorAll('.pm-hueco'))
          .map(function(i){ return i.value.trim(); });
      }

      function distOperadores(paso){
        return Array.prototype.slice
          .call(distCadena(paso).querySelectorAll('.pm-op'))
          .map(function(b){ return b.getAttribute('data-op-valor') || ''; });
      }

      function marcarOps(paso, ops, esperadas, clase){
        const botones = distCadena(paso).querySelectorAll('.pm-op');
        Array.prototype.forEach.call(botones, function(b, i){
          b.classList.remove('pm-mal', 'pm-bien');
          if (clase) b.classList.add(clase);
          else if (ops[i] !== esperadas[i]) b.classList.add('pm-mal');
        });
      }

      function comprobarDistPaso1(){
        const cadena = distCadena(1);
        const inputs = Array.prototype.slice.call(cadena.querySelectorAll('.pm-hueco'));
        const vals = distValores(1);
        const ops = distOperadores(1);

        if (vals.some(function(v){ return v === ''; })) {
          const vacio = inputs[vals.indexOf('')];
          if (vacio) vacio.focus();
          mostrarAviso('Escribe los cuatro números y coloca los paréntesis si quieres.');
          return;
        }
        if (ops.some(function(o){ return o === ''; })) {
          const boton = cadena.querySelector('.pm-op[data-op-valor=""]');
          if (boton) boton.focus();
          mostrarAviso('Elige la operación (× o +) de cada hueco.');
          return;
        }

        const nums = vals.map(Number);
        const numsOk = nums.every(function(n, i){
          return Number.isFinite(n) && n === actual.esperados[i];
        });
        const opsOk = ops.every(function(o, i){ return o === actual.opsEsperadas[i]; });
        const ok = numsOk && opsOk;
        const pares = parentesisDist();
        const tu = textoDist(actual, vals, pares, ops);

        if (ok) {
          actual.valsPaso1 = vals;
          actual.opsPaso1 = ops;
          actual.paresPaso1 = pares;
          actual.paso = 2;

          inputs.forEach(function(inp){
            inp.classList.remove('pm-mal');
            inp.classList.add('pm-bien');
            inp.readOnly = true;
          });
          marcarOps(1, ops, actual.opsEsperadas, 'pm-bien');
          Array.prototype.forEach.call(cadena.querySelectorAll('.pm-op'), function(b){
            b.disabled = true;
          });
          cadena.parentElement.querySelector('.pm-agrupa').hidden = true;

          const paso2 = el('pm-builder').querySelector('.pm-dist-paso2');
          paso2.hidden = false;
          el('pm-consigna').textContent =
            'Ahora elige la operación y calcula los productos y el resultado final.';
          limpiarResultado();

          const primero = paso2.querySelector('.pm-hueco');
          if (primero) {
            try { primero.focus({ preventScroll: true }); } catch (e) { primero.focus(); }
          }
        } else {
          inputs.forEach(function(inp, i){
            inp.classList.toggle('pm-mal', nums[i] !== actual.esperados[i]);
          });
          marcarOps(1, ops, actual.opsEsperadas, null);
          errores++;
          window.MatesCore.puntuar('pm', false);
          agregarHistorial([
            '❌ Tú: ' + tu,
            '✔️ Correcto: ' + actual.completa
          ], false);
          actualizarContadores();

          const r = el('pm-resultado');
          r.textContent = numsOk
            ? '❌ Revisa las operaciones que has elegido en cada hueco.'
            : '❌ No es correcto. Aplica la propiedad distributiva y vuelve a intentarlo.';
          r.className = 'pm-resultado pm-ko';

          const primerMal = inputs.filter(function(inp, i){ return nums[i] !== actual.esperados[i]; })[0];
          const primerOpMal = cadena.querySelector('.pm-op.pm-mal');
          if (primerMal) { primerMal.focus(); primerMal.select(); }
          else if (primerOpMal) { primerOpMal.focus(); }
        }
      }

      function comprobarDistPaso2(){
        const paso2 = el('pm-builder').querySelector('.pm-dist-paso2');
        const inputs = Array.prototype.slice.call(paso2.querySelectorAll('.pm-hueco'));
        const vals = distValores(2);
        const ops = distOperadores(2);

        if (vals.some(function(v){ return v === ''; })) {
          const vacio = inputs[vals.indexOf('')];
          if (vacio) vacio.focus();
          mostrarAviso('Calcula los dos productos y escribe también el resultado.');
          return;
        }
        if (ops.some(function(o){ return o === ''; })) {
          const boton = paso2.querySelector('.pm-op[data-op-valor=""]');
          if (boton) boton.focus();
          mostrarAviso('Elige la operación (× o +) entre los dos productos.');
          return;
        }

        const nums = vals.map(Number);
        const numsOk = nums.every(function(n, i){
          return Number.isFinite(n) && n === actual.esperadosPaso2[i];
        });
        const opsOk = ops[0] === actual.opsEsperadasPaso2[0];
        const ok = numsOk && opsOk;

        const val = function(v){ return v === '' ? '?' : v; };
        const paso1 = textoDist(actual, actual.valsPaso1, actual.paresPaso1, actual.opsPaso1);
        const tu = paso1 + ' = ' + val(vals[0]) + ' ' + (ops[0] || '?') + ' ' + val(vals[1]) +
          ' = ' + val(vals[2]);
        const correcta = actual.completa + ' = ' + actual.terminos[0] + ' ' + actual.op2 + ' ' +
          actual.terminos[1] + ' = ' + actual.resultado;

        if (ok) {
          inputs.forEach(function(inp){ inp.classList.add('pm-bien'); });
          marcarOps(2, ops, actual.opsEsperadasPaso2, 'pm-bien');
          aciertos++;
          window.MatesCore.puntuar('pm', true);
          agregarHistorial(['✅ ' + correcta], true);
          actualizarContadores();
          generar();
        } else {
          inputs.forEach(function(inp, i){
            inp.classList.toggle('pm-mal', nums[i] !== actual.esperadosPaso2[i]);
          });
          marcarOps(2, ops, actual.opsEsperadasPaso2, null);
          errores++;
          window.MatesCore.puntuar('pm', false);
          agregarHistorial(['❌ Tú: ' + tu, '✔️ Correcto: ' + correcta], false);
          actualizarContadores();

          const r = el('pm-resultado');
          r.textContent = numsOk
            ? '❌ Revisa la operación que has elegido entre los dos productos.'
            : '❌ Revisa los productos y el resultado final.';
          r.className = 'pm-resultado pm-ko';

          const primerMal = inputs.filter(function(inp, i){ return nums[i] !== actual.esperadosPaso2[i]; })[0];
          const primerOpMal = paso2.querySelector('.pm-op.pm-mal');
          if (primerMal) { primerMal.focus(); primerMal.select(); }
          else if (primerOpMal) { primerOpMal.focus(); }
        }
      }

      function comprobarDist(){
        if (actual.paso === 2) comprobarDistPaso2();
        else comprobarDistPaso1();
      }

      function comprobar(){
        if (!actual) return;
        if (actual.modo === 'grupos') comprobarGrupos();
        else if (actual.modo === 'dist') comprobarDist();
        else comprobarHuecos();
      }

      /* ---------- Eventos ---------- */

      el('pm-generar').addEventListener('click', generar);
      el('pm-otra').addEventListener('click', generar);
      el('pm-comprobar').addEventListener('click', comprobar);
      el('pm-tipo').addEventListener('change', generar);
      el('pm-pista').addEventListener('click', function(){
        mostrarAyuda(el('pm-ayuda').hidden);
      });

      el('pm-operacion').addEventListener('input', function(e){
        if (!e.target.classList.contains('pm-hueco')) return;
        const limpio = e.target.value.replace(/[^\d]/g, '');
        if (limpio !== e.target.value) e.target.value = limpio;
        el('pm-operacion').querySelectorAll('.pm-mal').forEach(function(inp){
          inp.classList.remove('pm-mal');
        });
        limpiarResultado();
      });

      el('pm-builder').addEventListener('input', function(e){
        if (!e.target.classList.contains('pm-hueco')) return;
        const limpio = e.target.value.replace(/[^\d]/g, '');
        if (limpio !== e.target.value) e.target.value = limpio;
        el('pm-builder').querySelectorAll('.pm-mal').forEach(function(inp){
          inp.classList.remove('pm-mal');
        });
        limpiarResultado();
      });

      el('pm-builder').addEventListener('click', function(e){
        const opBtn = e.target.closest('.pm-op');
        if (opBtn) {
          if (opBtn.disabled) return;
          const valor = opBtn.getAttribute('data-op-valor') || '';
          const siguiente = valor === '' ? '×' : valor === '×' ? '+' : '';
          opBtn.setAttribute('data-op-valor', siguiente);
          opBtn.textContent = siguiente || '?';
          opBtn.classList.toggle('pm-elegido', siguiente !== '');
          opBtn.classList.remove('pm-mal', 'pm-bien');
          limpiarResultado();
          return;
        }

        const btn = e.target.closest('.pm-agrupa-btn');
        if (!btn) return;

        if (btn.hasAttribute('data-grupo')) {
          const indice = Number(btn.getAttribute('data-grupo'));
          const grupo = el('pm-builder').querySelectorAll('.pm-producto')[indice];
          if (!grupo) return;
          const activo = grupo.getAttribute('data-par') !== '1';
          grupo.setAttribute('data-par', activo ? '1' : '0');
          btn.classList.toggle('pm-activo', activo);
          btn.setAttribute('aria-pressed', activo ? 'true' : 'false');
          btn.textContent = (activo ? '( ) Quitar ' : '( ) Paréntesis ') +
            (indice === 0 ? '1.º' : '2.º');
          limpiarResultado();
          return;
        }

        const forma = btn.getAttribute('data-forma');
        const agrupa = btn.getAttribute('data-agrupa');
        const cadena = el('pm-builder').querySelector('.pm-cadena[data-forma="' + forma + '"]');
        if (!cadena) return;

        const vals = ['', '', ''];
        cadena.querySelectorAll('.pm-hueco').forEach(function(inp){
          vals[Number(inp.getAttribute('data-i'))] = inp.value;
        });

        const nuevo = cadena.getAttribute('data-agrupa') === agrupa ? '' : agrupa;
        cadena.setAttribute('data-agrupa', nuevo);
        cadena.innerHTML = cadenaGrupoHTML(actual, nuevo, vals);

        cadena.parentElement.querySelectorAll('.pm-agrupa-btn').forEach(function(b){
          const on = b.getAttribute('data-agrupa') === nuevo;
          b.classList.toggle('pm-activo', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });

        limpiarResultado();
      });

      document.addEventListener('keydown', function(e){
        if (e.key !== 'Enter') return;

        const panel = el('tab-propiedades');
        if (!panel || !panel.classList.contains('active')) return;

        const destino = e.target;
        if (destino && destino.tagName === 'SELECT') return;

        e.preventDefault();
        comprobar();
      });

      generar();
    })();
