
    (function(){
      'use strict';

      /* ---------- Utilidades ---------- */

      var ultimoId = 0;
      var actual = null;
      var aciertos = 0;
      var errores = 0;
      var temporizador = null;

      function r(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
      function el(id){ return document.getElementById(id); }

      function N(v){ return { id: ++ultimoId, t: 'n', v: v }; }
      function O(op, izq, der){ return { id: ++ultimoId, t: 'o', op: op, l: izq, r: der }; }

      var PREC = { '+': 1, '−': 1, '×': 2, '÷': 2 };

      var ETIQUETAS = {
        sin: 'Sin paréntesis',
        con: 'Con paréntesis'
      };

      function nombreOp(op){
        if (op === '+') return 'suma';
        if (op === '−') return 'resta';
        if (op === '×') return 'multiplicación';
        return 'división';
      }

      /* Comprueba que la expresión se puede resolver con números naturales:
         sin restas negativas y con divisiones exactas. */
      function evaluar(n){
        if (n.t === 'n') return { ok: true, v: n.v };

        var a = evaluar(n.l);
        var b = evaluar(n.r);
        if (!a.ok || !b.ok) return { ok: false };

        var v;
        if (n.op === '+') v = a.v + b.v;
        else if (n.op === '−') v = a.v - b.v;
        else if (n.op === '×') v = a.v * b.v;
        else {
          if (b.v === 0 || a.v % b.v !== 0) return { ok: false };
          v = a.v / b.v;
        }

        if (!Number.isFinite(v) || v < 0) return { ok: false };
        return { ok: true, v: v };
      }

      function contarOps(n){
        if (n.t === 'n') return 0;
        return 1 + contarOps(n.l) + contarOps(n.r);
      }

      function necesitaParentesis(prec, parentPrec, esDerecha, opPadre){
        if (prec < parentPrec) return true;
        return prec === parentPrec && esDerecha && (opPadre === '−' || opPadre === '÷');
      }

      function hijoEnParentesis(hijo, prec, esDerecha, opPadre, enParentesis){
        if (hijo.t === 'n') return enParentesis;
        return enParentesis || necesitaParentesis(PREC[hijo.op], prec, esDerecha, opPadre);
      }

      /* Busca la primera operación reducible. Si hay paréntesis, prioriza
         siempre lo que está dentro de ellos (regla: primero los paréntesis). */
      function recolectar(n, prec, esDerecha, opPadre, enParentesis, res){
        if (n.t === 'n') return;

        var p = PREC[n.op];

        recolectar(n.l, p, false, n.op,
          hijoEnParentesis(n.l, p, false, n.op, enParentesis), res);

        if (n.l.t === 'n' && n.r.t === 'n') {
          if (enParentesis) {
            if (!res.dentro) res.dentro = n;
          } else if (!res.fuera) {
            res.fuera = n;
          }
        }

        recolectar(n.r, p, true, n.op,
          hijoEnParentesis(n.r, p, true, n.op, enParentesis), res);
      }

      function buscarSiguiente(n){
        var res = { dentro: null, fuera: null };
        recolectar(n, 0, false, '', false, res);
        return res.dentro || res.fuera;
      }

      function reducir(n, id, valor){
        if (n.t === 'n') return n;
        if (n.id === id) return N(valor);
        n.l = reducir(n.l, id, valor);
        n.r = reducir(n.r, id, valor);
        return n;
      }

      /* ---------- Generador de expresiones ---------- */

      function divisoresDe(valor){
        var ds = [];
        var max = Math.min(valor, 12);
        for (var d = 2; d <= max; d++) {
          if (valor % d === 0) ds.push(d);
        }
        return ds;
      }

      function factorPara(valor){
        if (valor > 200) return r(2, 3);
        if (valor > 50) return r(2, 4);
        return r(2, 6);
      }

      function pasoMultiplicativo(nodo, valor){
        var ds = divisoresDe(valor);
        if (ds.length > 0 && (r(0, 2) === 0 || valor > 300)) {
          var d = ds[r(0, ds.length - 1)];
          return { arbol: O('÷', nodo, N(d)), valor: valor / d };
        }

        var f = factorPara(valor);
        return { arbol: O('×', nodo, N(f)), valor: valor * f };
      }

      /* Término sin paréntesis: número o cadena de × / ÷. */
      function crearTerminoPlano(k){
        var valor = r(1, 9);
        var nodo = N(valor);

        for (var i = 0; i < k; i++) {
          var paso = pasoMultiplicativo(nodo, valor);
          nodo = paso.arbol;
          valor = paso.valor;
        }

        return { arbol: nodo, valor: valor };
      }

      /* Bloque con paréntesis: (sumas y restas) seguido de × / ÷.
         El paréntesis siempre es visible porque fuera queda una operación
         de mayor prioridad. */
      function crearBloque(k){
        var internas = r(1, k - 1);
        var valor = r(2, 9);
        var grupo = N(valor);

        for (var i = 0; i < internas; i++) {
          if (valor > 2 && r(0, 2) === 0) {
            var resta = r(1, Math.min(9, valor - 1));
            grupo = O('−', grupo, N(resta));
            valor -= resta;
          } else {
            var suma = r(1, 9);
            grupo = O('+', grupo, N(suma));
            valor += suma;
          }
        }

        var nodo = grupo;
        var externas = k - internas;

        for (var j = 0; j < externas; j++) {
          var paso = pasoMultiplicativo(nodo, valor);
          nodo = paso.arbol;
          valor = paso.valor;
        }

        return { arbol: nodo, valor: valor };
      }

      function crearSimple(){
        var op = ['+', '−', '×', '÷'][r(0, 3)];
        var b = r(2, 9);
        var a = r(2, 20);

        if (op === '−' && a <= b) a = b + r(1, 10);
        if (op === '÷') a = b * r(2, 9);

        var nodo = O(op, N(a), N(b));
        return { arbol: nodo, valor: evaluar(nodo).v };
      }

      function construir(nivel, nOps){
        if (nOps === 1) {
          var simple = crearSimple();
          return { arbol: simple.arbol, nivel: nivel, ops: 1 };
        }

        var t;
        if (nivel === 'con' && nOps === 2) t = 1;
        else t = Math.max(2, Math.min(nOps + 1, Math.ceil(nOps / 3) + 1));

        var M = nOps - (t - 1);

        var b = 0;
        if (nivel === 'con') {
          b = Math.max(1, Math.min(Math.floor(t / 3), Math.floor(M / 2)));
        }

        var k = [];
        var i;
        for (i = 0; i < t; i++) k.push(0);

        var indices = [];
        for (i = 0; i < t; i++) indices.push(i);
        for (i = indices.length - 1; i > 0; i--) {
          var j = r(0, i);
          var tmp = indices[i];
          indices[i] = indices[j];
          indices[j] = tmp;
        }

        var esBloque = {};
        if (b > 0) {
          indices.slice(0, b).forEach(function(idx){
            k[idx] = 2;
            esBloque[idx] = true;
          });

          var restante = M - 2 * b;
          var inicio = r(0, t - 1);
          for (i = 0; i < restante; i++) k[(inicio + i) % t]++;
        } else {
          var inicioSin = r(0, t - 1);
          for (i = 0; i < M; i++) k[(inicioSin + i) % t]++;
        }

        var terminos = [];
        for (i = 0; i < t; i++) {
          terminos.push(esBloque[i] ? crearBloque(k[i]) : crearTerminoPlano(k[i]));
        }

        var arbol = terminos[0].arbol;
        var total = terminos[0].valor;

        for (i = 1; i < t; i++) {
          var termino = terminos[i];
          var op = (termino.valor <= total && r(0, 1) === 0) ? '−' : '+';
          arbol = O(op, arbol, termino.arbol);
          total = op === '−' ? total - termino.valor : total + termino.valor;
        }

        return { arbol: arbol, nivel: nivel, ops: contarOps(arbol) };
      }

      function crearArbol(nivel, nOps){
        var generado = null;

        for (var intento = 0; intento < 20; intento++) {
          generado = construir(nivel, nOps);
          if (evaluar(generado.arbol).ok) return generado;
        }

        return generado;
      }

      /* ---------- Dibujar la expresión ---------- */

      function htmlArbol(n, parentPrec, esDerecha, opPadre){
        if (n.t === 'n') return '<span class="oc-num">' + n.v + '</span>';

        var prec = PREC[n.op];
        var html = htmlArbol(n.l, prec, false, n.op) +
          '<button type="button" class="oc-op" data-id="' + n.id + '" aria-label="Resolver la ' +
            nombreOp(n.op) + '">' + n.op + '</button>' +
          htmlArbol(n.r, prec, true, n.op);

        if (necesitaParentesis(prec, parentPrec, esDerecha, opPadre)) {
          html = '<span class="oc-par">(</span>' + html + '<span class="oc-par">)</span>';
        }
        return html;
      }

      function textoArbol(n, parentPrec, esDerecha, opPadre){
        if (n.t === 'n') return String(n.v);

        var prec = PREC[n.op];
        var texto = textoArbol(n.l, prec, false, n.op) + ' ' + n.op + ' ' +
          textoArbol(n.r, prec, true, n.op);

        if (necesitaParentesis(prec, parentPrec, esDerecha, opPadre)) {
          texto = '(' + texto + ')';
        }
        return texto;
      }

      function renderExpresion(){
        actual.textoActual = textoArbol(actual.arbol, 0, false, '');
        el('oc-expresion').innerHTML = htmlArbol(actual.arbol, 0, false, '');
      }

      function nivelRegla(){
        if (!actual) return 3;
        if (actual.textoActual.indexOf('(') !== -1) return 1;
        var siguiente = buscarSiguiente(actual.arbol);
        return siguiente && (siguiente.op === '×' || siguiente.op === '÷') ? 2 : 3;
      }

      function actualizarJerarquia(){
        var nivel = nivelRegla();
        el('oc-jerarquia').querySelectorAll('.oc-jer').forEach(function(chip){
          chip.classList.toggle('oc-activa', Number(chip.getAttribute('data-nivel')) === nivel);
        });
      }

      /* ---------- Interfaz ---------- */

      function limpiarResultado(){
        var res = el('oc-resultado');
        res.textContent = '';
        res.className = 'oc-resultado';
      }

      function mostrarAviso(texto){
        var res = el('oc-resultado');
        res.textContent = texto;
        res.className = 'oc-resultado oc-aviso';
      }

      function mostrarAyuda(mostrar){
        el('oc-ayuda').hidden = !mostrar;
        var btn = el('oc-pista');
        btn.textContent = mostrar ? '🙈 Ocultar pista' : '💡 Ver pista';
        btn.setAttribute('aria-expanded', mostrar ? 'true' : 'false');
      }

      function textoAyuda(){
        return '<strong>Orden de las operaciones:</strong>' +
          '<ol class="oc-lista-reglas">' +
            '<li><strong>Paréntesis</strong> primero.</li>' +
            '<li>Después, <strong>multiplicaciones y divisiones</strong>, de izquierda a derecha.</li>' +
            '<li>Al final, <strong>sumas y restas</strong>, de izquierda a derecha.</li>' +
          '</ol>' +
          '<span class="oc-ejemplo">Ejemplo: 3 + 4 × 2 → primero 4 × 2 = 8 → después 3 + 8 = 11.</span>';
      }

      function agregarHistorial(lineas, correcto){
        var lista = el('oc-listaHistorial');
        var li = window.MatesCore.itemHistorial(correcto ? 'oc-ok' : 'oc-ko', lineas);
        lista.prepend(li);
        while (lista.children.length > 50) lista.removeChild(lista.lastChild);
      }

      function actualizarContadores(){
        el('oc-aciertos').textContent = aciertos;
        el('oc-errores').textContent = errores;
      }

      function enfocarPrimeraOperacion(){
        var boton = el('oc-expresion').querySelector('.oc-op');
        if (!boton) return;
        try { boton.focus({ preventScroll: true }); } catch (e) { boton.focus(); }
      }

      function numeroOperaciones(){
        var bruto = el('oc-numOps').value.trim();
        var n = bruto === '' ? 5 : Number(bruto);
        if (!Number.isFinite(n)) n = 5;
        n = Math.round(n);
        n = Math.max(1, Math.min(99, n));
        el('oc-numOps').value = n;
        return n;
      }

      /* ---------- Generar pregunta ---------- */

      function generar(){
        if (temporizador) {
          clearTimeout(temporizador);
          temporizador = null;
        }

        ultimoId = 0;
        var nivel = el('oc-tipo').value === 'con' ? 'con' : 'sin';
        var creado = crearArbol(nivel, numeroOperaciones());
        var arbol = creado.arbol;

        actual = {
          nivel: creado.nivel,
          arbol: arbol,
          pasos: contarOps(arbol),
          hechos: 0,
          cadena: [textoArbol(arbol, 0, false, '')],
          textoActual: '',
          paso: null,
          resuelto: false
        };

        var tarjeta = el('oc-tarjeta');
        tarjeta.setAttribute('data-nivel', creado.nivel);
        el('oc-etiqueta').textContent = '🧠 ' + ETIQUETAS[creado.nivel] + ' · ' +
          actual.pasos + (actual.pasos === 1 ? ' operación' : ' operaciones');

        el('oc-consigna').textContent = 'Toca la operación que se resuelve primero.';
        el('oc-paso').hidden = true;
        el('oc-paso').innerHTML = '';
        el('oc-comprobar').hidden = true;
        limpiarResultado();
        mostrarAyuda(false);

        renderExpresion();
        actualizarJerarquia();
        actualizarContadores();
      }

      /* ---------- Elegir la operación ---------- */

      function explicarError(objetivo, elegido){
        if (actual.textoActual.indexOf('(') !== -1) {
          return 'Todavía no. Primero hay que resolver lo que está dentro del paréntesis, de izquierda a derecha.';
        }
        if ((objetivo.op === '×' || objetivo.op === '÷') &&
            (elegido.op === '+' || elegido.op === '−')) {
          return 'Todavía no. Las multiplicaciones y divisiones van antes que las sumas y restas.';
        }
        return 'Todavía no. Las operaciones del mismo nivel se resuelven de izquierda a derecha: empieza por la primera.';
      }

      function seleccionarOperacion(id){
        if (!actual || actual.resuelto || actual.paso) return;

        var objetivo = buscarSiguiente(actual.arbol);
        if (!objetivo) return;

        var boton = el('oc-expresion').querySelector('.oc-op[data-id="' + id + '"]');
        if (!boton) return;

        if (id !== objetivo.id) {
          boton.classList.add('oc-op-mal');
          setTimeout(function(){ boton.classList.remove('oc-op-mal'); }, 900);
          mostrarAviso(explicarError(objetivo, { op: boton.textContent }));
          return;
        }

        actual.paso = {
          nodo: objetivo,
          a: objetivo.l.v,
          b: objetivo.r.v,
          op: objetivo.op,
          resultado: evaluar(objetivo).v
        };

        el('oc-expresion').querySelectorAll('.oc-op').forEach(function(b){
          b.disabled = true;
          b.classList.remove('oc-op-mal');
        });
        boton.classList.add('oc-op-elegida');
        limpiarResultado();
        mostrarPaso();
      }

      function mostrarPaso(){
        var p = actual.paso;
        var cont = el('oc-paso');

        cont.hidden = false;
        cont.innerHTML =
          '<span class="oc-paso-num">Paso ' + (actual.hechos + 1) + ' de ' + actual.pasos + '</span>' +
          '<span class="oc-calc">' + p.a + ' ' + p.op + ' ' + p.b + ' =</span>' +
          '<input id="oc-resp" class="oc-resp" type="text" inputmode="numeric" autocomplete="off" ' +
            'spellcheck="false" aria-label="Resultado de ' + p.a + ' ' + nombreOp(p.op) + ' ' + p.b + '">';

        el('oc-comprobar').hidden = false;
        el('oc-consigna').textContent = 'Escribe el resultado de la operación marcada.';
        actualizarJerarquia();

        var input = el('oc-resp');
        input.addEventListener('input', function(){
          var limpio = input.value.replace(/[^\d]/g, '');
          if (limpio !== input.value) input.value = limpio;
          input.classList.remove('oc-mal');
          limpiarResultado();
        });

        try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
      }

      /* ---------- Comprobar ---------- */

      function comprobar(){
        if (!actual || actual.resuelto || !actual.paso) return;

        var input = el('oc-resp');
        if (!input) return;

        var bruto = input.value.trim();
        if (bruto === '') {
          input.focus();
          mostrarAviso('Escribe el resultado de la operación.');
          return;
        }

        var valor = Number(bruto);
        var p = actual.paso;
        var calculo = p.a + ' ' + p.op + ' ' + p.b + ' = ' + valor;

        if (valor === p.resultado) {
          input.classList.remove('oc-mal');
          input.classList.add('oc-bien');
          input.readOnly = true;

          el('oc-comprobar').hidden = true;
          el('oc-paso').hidden = true;
          el('oc-paso').innerHTML = '';

          actual.hechos++;
          actual.arbol = reducir(actual.arbol, p.nodo.id, p.resultado);
          actual.cadena.push(textoArbol(actual.arbol, 0, false, ''));
          actual.paso = null;

          renderExpresion();
          actualizarJerarquia();

          if (actual.hechos < actual.pasos) {
            var res = el('oc-resultado');
            res.textContent = '✅ ' + calculo + '. ¡Bien! Ahora elige la siguiente operación.';
            res.className = 'oc-resultado oc-ok';
            el('oc-consigna').textContent = 'Toca la operación que se resuelve ahora.';
            enfocarPrimeraOperacion();
          } else {
            terminar();
          }
        } else {
          input.classList.add('oc-mal');
          errores++;
          window.MatesCore.puntuar('oc', false);
          agregarHistorial([
            '❌ Tú: ' + calculo,
            '✔️ Correcto: ' + p.a + ' ' + p.op + ' ' + p.b + ' = ' + p.resultado
          ], false);
          actualizarContadores();

          var error = el('oc-resultado');
          error.textContent = '❌ Revisa la ' + nombreOp(p.op) + ' y vuelve a intentarlo.';
          error.className = 'oc-resultado oc-ko';

          input.focus();
          input.select();
        }
      }

      function terminar(){
        actual.resuelto = true;
        var cadena = actual.cadena.join(' = ');
        var total = actual.arbol.v;

        el('oc-expresion').innerHTML = '<span class="oc-final">' + cadena + '</span>';
        el('oc-jerarquia').querySelectorAll('.oc-jer').forEach(function(chip){
          chip.classList.remove('oc-activa');
        });
        el('oc-consigna').textContent = '¡Operación combinada terminada!';
        el('oc-paso').hidden = true;
        el('oc-paso').innerHTML = '';
        el('oc-comprobar').hidden = true;

        var res = el('oc-resultado');
        res.textContent = '🎉 ¡Todo correcto! Resultado final: ' + total;
        res.className = 'oc-resultado oc-ok';

        aciertos++;
        window.MatesCore.puntuar('oc', true);
        agregarHistorial(['✅ ' + cadena], true);
        actualizarContadores();

        temporizador = setTimeout(generar, 1800);
      }

      /* ---------- Eventos ---------- */

      el('oc-generar').addEventListener('click', generar);
      el('oc-otra').addEventListener('click', generar);
      el('oc-comprobar').addEventListener('click', comprobar);
      el('oc-tipo').addEventListener('change', generar);
      el('oc-numOps').addEventListener('change', generar);

      el('oc-expresion').addEventListener('click', function(e){
        var boton = e.target.closest('.oc-op');
        if (!boton || boton.disabled) return;
        seleccionarOperacion(Number(boton.getAttribute('data-id')));
      });

      el('oc-pista').addEventListener('click', function(){
        mostrarAyuda(el('oc-ayuda').hidden);
      });

      document.addEventListener('keydown', function(e){
        if (e.key !== 'Enter') return;

        var panel = el('tab-combinadas');
        if (!panel || !panel.classList.contains('active')) return;

        var destino = e.target;
        if (destino && (destino.tagName === 'SELECT' || destino.tagName === 'BUTTON')) return;

        e.preventDefault();

        if (destino && destino.id === 'oc-numOps') generar();
        else comprobar();
      });

      el('oc-ayuda').innerHTML = textoAyuda();
      generar();
    })();
