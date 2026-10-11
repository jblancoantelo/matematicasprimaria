
    (function(){
      const POS = [
        { c: 'CMmM', n: 'Centenas de millar de millón', m: 100000000000 },
        { c: 'DMmM', n: 'Decenas de millar de millón',  m: 10000000000  },
        { c: 'UMmM', n: 'Unidades de millar de millón', m: 1000000000   },
        { c: 'CMM',  n: 'Centenas de millón',           m: 100000000    },
        { c: 'DMM',  n: 'Decenas de millón',            m: 10000000     },
        { c: 'UMM',  n: 'Unidades de millón',           m: 1000000      },
        { c: 'CM',   n: 'Centenas de millar',           m: 100000       },
        { c: 'DM',   n: 'Decenas de millar',            m: 10000        },
        { c: 'UM',   n: 'Unidades de millar',           m: 1000         },
        { c: 'C',    n: 'Centenas',                     m: 100          },
        { c: 'D',    n: 'Decenas',                      m: 10           },
        { c: 'U',    n: 'Unidades',                     m: 1            }
      ];
      let numero = 0;
      let filas = [];
      let aciertos = 0;
      let errores = 0;
      let comprobado = true;

      function separar(n){
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }

      function generar(){
        const cifras = parseInt(document.getElementById('dm-cifras').value, 10);
        const min = Math.pow(10, cifras - 1);
        const max = Math.pow(10, cifras) - 1;
        numero = min + Math.floor(Math.random() * (max - min + 1));

        const caja = document.getElementById('dm-numero');
        caja.innerHTML = '';
        String(numero).split('').forEach(function(d){
          const sp = document.createElement('span');
          sp.className = 'dm-caja';
          sp.textContent = d;
          caja.appendChild(sp);
        });

        const rows = document.getElementById('dm-rows');
        rows.innerHTML = '';
        filas = [];
        const digitos = String(numero).split('').map(Number);
        const ps = POS.slice(-digitos.length);
        digitos.forEach(function(d, i){
          const p = ps[i];
          const fila = document.createElement('div');
          fila.className = 'dm-fila';
          const etq = document.createElement('span');
          etq.className = 'dm-nombre';
          etq.innerHTML = '<b>' + p.c + '</b> · ' + p.n;
          const input = document.createElement('input');
          input.type = 'text';
          input.inputMode = 'numeric';
          input.autocomplete = 'off';
          input.className = 'dm-input';
          input.maxLength = String(9 * p.m).length;
          input.addEventListener('keydown', function(e){ if (e.key === 'Enter') comprobar(); });
          fila.appendChild(etq);
          fila.appendChild(input);
          rows.appendChild(fila);
          filas.push({ p: p, input: input, valor: d * p.m });
        });

        document.getElementById('dm-resultado').textContent = '';
        document.getElementById('dm-resultado').className = '';
        comprobado = false;
        if (filas[0]) filas[0].input.focus();
      }

      function comprobar(){
        if (!filas.length || comprobado) return;
        const rows = document.getElementById('dm-rows');
        rows.querySelectorAll('.dm-ayuda').forEach(function(e){ e.remove(); });
        filas.forEach(function(f){ f.ayuda = null; });

        let bien = 0;
        const total = filas.length;
        filas.forEach(function(f){
          const txt = f.input.value.trim();
          const num = txt === '' ? NaN : parseInt(txt, 10);
          const ok = num === f.valor;
          f.input.classList.toggle('dm-bien', ok);
          f.input.classList.toggle('dm-mal', !ok);
          if (ok) {
            bien++;
          } else {
            const s = document.createElement('span');
            s.className = 'dm-ayuda';
            s.textContent = '→ ' + f.valor;
            f.input.parentNode.appendChild(s);
            f.ayuda = s;
          }
        });

        const todosBien = bien === total;
        const resultado = document.getElementById('dm-resultado');
        const textoNum = separar(numero);

        if (todosBien) {
          const suma = filas.map(function(f){ return ' ' + f.valor; }).join(' + ');
          resultado.textContent = '✅ ¡Correcto! ' + textoNum + ' =' + suma + '.';
          resultado.className = 'dm-correcto';
          aciertos++;
          comprobado = true;
          window.MatesCore.puntuar('dm', true);
          setTimeout(generar, 2600);
        } else {
          resultado.textContent = '❌ Revisa las filas en rojo: ' + bien + ' de ' + total + ' bien. Corrige y vuelve a pulsar «Comprobar».';
          resultado.className = 'dm-incorrecto';
          errores++;
          window.MatesCore.puntuar('dm', false);
        }

        document.getElementById('dm-aciertos').textContent = aciertos;
        document.getElementById('dm-errores').textContent = errores;

        const historial = document.getElementById('dm-listaHistorial');
        const li = document.createElement('li');
        li.className = todosBien ? 'dm-correcto' : 'dm-incorrecto';
        li.textContent = textoNum + ' → ' + (todosBien ? '✅ descompuesto' : bien + ' de ' + total + ' correctas');
        historial.prepend(li);
      }

      document.getElementById('dm-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('dm-comprobar').addEventListener('click', function(){ comprobar(); });
      document.getElementById('dm-cifras').addEventListener('change', function(){ generar(); });
      generar();
    })();
  