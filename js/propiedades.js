
    (function(){
      const PROPIEDADES = {
        conmutativa: {
          nombre: 'Conmutativa',
          emoji: '🔵',
          regla: 'El orden de los factores no cambia el producto.',
          formula: 'a × b = b × a'
        },
        asociativa: {
          nombre: 'Asociativa',
          emoji: '🟢',
          regla: 'Al multiplicar tres números, da igual cómo los agrupemos.',
          formula: '(a × b) × c = a × (b × c)'
        },
        distributiva: {
          nombre: 'Distributiva',
          emoji: '🟣',
          regla: 'Multiplicar por una suma (o una resta) es multiplicar por cada término y después sumar (o restar).',
          formula: 'a × (b + c) = a × b + a × c'
        }
      };

      const HUECO = '<input class="pm-hueco" id="pm-hueco" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="Número que falta">';

      let actual = null;
      let aciertos = 0;
      let errores = 0;
      let turno = 0;

      function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
      function el(id){ return document.getElementById(id); }

      /* ---------- Generadores de preguntas ---------- */

      function genConmutativa(){
        const a = randInt(2, 12);
        let b = randInt(2, 12);
        while (b === a) b = randInt(2, 12);

        const completa = a + ' × ' + b + ' = ' + b + ' × ' + a;
        const pista = 'Cambia el orden de los factores: ' + a + ' × ' + b + ' = ' + b + ' × ' + a + '.';

        if (randInt(0, 1) === 0) {
          return {
            prop: 'conmutativa',
            expr: a + ' × ' + b + ' = ' + b + ' × ' + HUECO,
            texto: a + ' × ' + b + ' = ' + b + ' × [ ]',
            falta: a,
            completa: completa,
            pista: pista
          };
        }
        return {
          prop: 'conmutativa',
          expr: a + ' × ' + b + ' = ' + HUECO + ' × ' + a,
          texto: a + ' × ' + b + ' = [ ] × ' + a,
          falta: b,
          completa: completa,
          pista: pista
        };
      }

      function genAsociativa(){
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        const c = randInt(2, 9);
        const completa = '(' + a + ' × ' + b + ') × ' + c + ' = ' + a + ' × (' + b + ' × ' + c + ')';
        const pista = 'Cambia la agrupación de los tres factores: ' + completa + '.';
        const variante = randInt(0, 2);

        if (variante === 0) {
          return {
            prop: 'asociativa',
            expr: '(' + a + ' × ' + b + ') × ' + c + ' = ' + a + ' × (' + b + ' × ' + HUECO + ')',
            texto: '(' + a + ' × ' + b + ') × ' + c + ' = ' + a + ' × (' + b + ' × [ ])',
            falta: c,
            completa: completa,
            pista: pista
          };
        }
        if (variante === 1) {
          return {
            prop: 'asociativa',
            expr: '(' + a + ' × ' + b + ') × ' + c + ' = ' + HUECO + ' × (' + b + ' × ' + c + ')',
            texto: '(' + a + ' × ' + b + ') × ' + c + ' = [ ] × (' + b + ' × ' + c + ')',
            falta: a,
            completa: completa,
            pista: pista
          };
        }
        return {
          prop: 'asociativa',
          expr: a + ' × (' + b + ' × ' + c + ') = (' + a + ' × ' + HUECO + ') × ' + c,
          texto: a + ' × (' + b + ' × ' + c + ') = (' + a + ' × [ ]) × ' + c,
          falta: b,
          completa: completa,
          pista: pista
        };
      }

      function genDistributiva(){
        const a = randInt(2, 9);
        const variante = randInt(0, 4);

        if (variante === 0) {
          const b = randInt(2, 9);
          const c = randInt(2, 9);
          return {
            prop: 'distributiva',
            expr: a + ' × (' + b + ' + ' + c + ') = ' + a + ' × ' + b + ' + ' + a + ' × ' + HUECO,
            texto: a + ' × (' + b + ' + ' + c + ') = ' + a + ' × ' + b + ' + ' + a + ' × [ ]',
            falta: c,
            completa: a + ' × (' + b + ' + ' + c + ') = ' + a + ' × ' + b + ' + ' + a + ' × ' + c,
            pista: 'Multiplica ' + a + ' por ' + b + ' y también por ' + c + ': ' + a + ' × ' + b + ' + ' + a + ' × ' + c + '.'
          };
        }
        if (variante === 1) {
          const b = randInt(2, 9);
          const c = randInt(2, 9);
          return {
            prop: 'distributiva',
            expr: a + ' × (' + b + ' + ' + c + ') = ' + a + ' × ' + HUECO + ' + ' + a + ' × ' + c,
            texto: a + ' × (' + b + ' + ' + c + ') = ' + a + ' × [ ] + ' + a + ' × ' + c,
            falta: b,
            completa: a + ' × (' + b + ' + ' + c + ') = ' + a + ' × ' + b + ' + ' + a + ' × ' + c,
            pista: 'Multiplica ' + a + ' por ' + b + ' y también por ' + c + ': ' + a + ' × ' + b + ' + ' + a + ' × ' + c + '.'
          };
        }
        if (variante === 2) {
          const b = randInt(2, 9);
          const c = randInt(2, 9);
          return {
            prop: 'distributiva',
            expr: '(' + b + ' + ' + c + ') × ' + a + ' = ' + b + ' × ' + a + ' + ' + HUECO + ' × ' + a,
            texto: '(' + b + ' + ' + c + ') × ' + a + ' = ' + b + ' × ' + a + ' + [ ] × ' + a,
            falta: c,
            completa: '(' + b + ' + ' + c + ') × ' + a + ' = ' + b + ' × ' + a + ' + ' + c + ' × ' + a,
            pista: 'Multiplica ' + b + ' por ' + a + ' y también ' + c + ' por ' + a + ': ' + b + ' × ' + a + ' + ' + c + ' × ' + a + '.'
          };
        }
        if (variante === 3) {
          const b = randInt(8, 15);
          const c = randInt(1, b - 3);
          return {
            prop: 'distributiva',
            expr: a + ' × (' + b + ' − ' + c + ') = ' + a + ' × ' + b + ' − ' + a + ' × ' + HUECO,
            texto: a + ' × (' + b + ' − ' + c + ') = ' + a + ' × ' + b + ' − ' + a + ' × [ ]',
            falta: c,
            completa: a + ' × (' + b + ' − ' + c + ') = ' + a + ' × ' + b + ' − ' + a + ' × ' + c,
            pista: 'Multiplica ' + a + ' por ' + b + ' y por ' + c + ', y después resta: ' + a + ' × ' + b + ' − ' + a + ' × ' + c + '.'
          };
        }

        // Distributiva para calcular: descomponer un número en decenas + unidades.
        const redondo = randInt(2, 9) * 10;
        const unidades = randInt(1, 9);
        const numero = redondo + unidades;
        return {
          prop: 'distributiva',
          expr: a + ' × ' + numero + ' = ' + a + ' × ' + redondo + ' + ' + a + ' × ' + HUECO,
          texto: a + ' × ' + numero + ' = ' + a + ' × ' + redondo + ' + ' + a + ' × [ ]',
          falta: unidades,
          completa: a + ' × ' + numero + ' = ' + a + ' × ' + redondo + ' + ' + a + ' × ' + unidades,
          pista: 'Descompón ' + numero + ' en ' + redondo + ' + ' + unidades + ' y multiplica ' + a + ' por cada parte.'
        };
      }

      /* ---------- Interfaz ---------- */

      function mostrarAyuda(mostrar){
        el('pm-ayuda').hidden = !mostrar;
        const btn = el('pm-pista');
        btn.textContent = mostrar ? '🙈 Ocultar pista' : '💡 Ver pista';
        btn.setAttribute('aria-expanded', mostrar ? 'true' : 'false');
      }

      function agregarHistorial(texto, correcto){
        const lista = el('pm-listaHistorial');
        const li = document.createElement('li');
        li.className = correcto ? 'pm-ok' : 'pm-ko';
        li.textContent = texto;
        lista.prepend(li);
        while (lista.children.length > 50) lista.removeChild(lista.lastChild);
      }

      function generar(){
        turno++;

        const seleccion = el('pm-tipo').value;
        const tipo = seleccion === 'mezcla'
          ? ['conmutativa', 'asociativa', 'distributiva'][randInt(0, 2)]
          : seleccion;

        let datos;
        if (tipo === 'conmutativa') datos = genConmutativa();
        else if (tipo === 'asociativa') datos = genAsociativa();
        else datos = genDistributiva();

        actual = datos;
        const info = PROPIEDADES[datos.prop];

        el('pm-tarjeta').setAttribute('data-prop', datos.prop);
        el('pm-etiqueta').textContent = info.emoji + ' Propiedad ' + info.nombre.toLowerCase();
        el('pm-consigna').textContent = 'Completa la igualdad con el número que falta.';
        el('pm-operacion').innerHTML = datos.expr;

        const resultado = el('pm-resultado');
        resultado.textContent = '';
        resultado.className = 'pm-resultado';

        el('pm-ayuda').innerHTML =
          '<strong>Propiedad ' + info.nombre.toLowerCase() + ':</strong> ' + info.regla +
          '<br><span class="pm-formula">' + info.formula + '</span>' +
          '<br>' + datos.pista;
        mostrarAyuda(false);

        const input = el('pm-hueco');
        if (input) {
          input.addEventListener('keydown', function(e){
            if (e.key === 'Enter') { e.preventDefault(); comprobar(); }
          });
          input.addEventListener('input', function(){
            input.classList.remove('pm-mal');
            if (resultado.classList.contains('pm-ko')) {
              resultado.textContent = '';
              resultado.className = 'pm-resultado';
            }
          });
          try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
        }
      }

      function comprobar(){
        if (!actual) return;
        const input = el('pm-hueco');
        if (!input) return;

        const txt = input.value.trim();
        if (txt === '') { input.focus(); return; }

        const valor = Number(txt.replace(/\s/g, '').replace(',', '.'));
        const esCorrecto = Number.isFinite(valor) && valor === actual.falta;
        const resultado = el('pm-resultado');

        if (esCorrecto) {
          input.classList.remove('pm-mal');
          input.classList.add('pm-bien');
          input.readOnly = true;
          resultado.textContent = '✅ ¡Correcto! ' + actual.completa;
          resultado.className = 'pm-resultado pm-ok';
          aciertos++;
          window.MatesCore.puntuar('pm', true);
          agregarHistorial(actual.completa + ' ✅', true);
          mostrarAyuda(true);

          const miTurno = turno;
          setTimeout(function(){ if (turno === miTurno) generar(); }, 3200);
        } else {
          input.classList.remove('pm-bien');
          input.classList.add('pm-mal');
          resultado.textContent = '❌ No es correcto. Fíjate en la propiedad y vuelve a intentarlo.';
          resultado.className = 'pm-resultado pm-ko';
          errores++;
          window.MatesCore.puntuar('pm', false);
          agregarHistorial(actual.texto + ' → ' + txt + ' ❌', false);
          input.select();
        }

        el('pm-aciertos').textContent = aciertos;
        el('pm-errores').textContent = errores;
      }

      el('pm-generar').addEventListener('click', generar);
      el('pm-comprobar').addEventListener('click', comprobar);
      el('pm-tipo').addEventListener('change', generar);
      el('pm-pista').addEventListener('click', function(){
        mostrarAyuda(el('pm-ayuda').hidden);
      });

      generar();
    })();
