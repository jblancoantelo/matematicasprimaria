
    (function(){
      let actual = null;
      let aciertos = 0;
      let errores = 0;

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      const VALORES = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
      function aRomano(n){
        const vals = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
        let r = '', num = n;
        vals.forEach(function(v){
          while (num >= v[0]) { r += v[1]; num -= v[0]; }
        });
        return r;
      }
      function aNormal(rom){
        let tot = 0, prev = 0;
        for (let i = rom.length - 1; i >= 0; i--) {
          const v = VALORES[rom[i]] || 0;
          if (v < prev) tot -= v; else tot += v;
          prev = v;
        }
        return tot;
      }

      function mostrarRomanos(){ return document.getElementById('tab-romanos').classList.contains('active'); }

      document.addEventListener('keydown', function(e){
        if (e.key === 'Enter' && mostrarRomanos()) verificar();
      });

      function generar(){
        const tipo = document.getElementById('nr-tipo').value;
        document.getElementById('nr-resultado').textContent = '';
        document.getElementById('nr-resultado').className = '';
        document.getElementById('nr-respuesta').value = '';
        actual = null;

        const enunciado = document.getElementById('nr-enunciado');
        if (tipo === 'aromano') {
          const n = randInt(1, 399);
          actual = { tipo, correcta: aRomano(n), texto: n + ' = ' + aRomano(n) };
          enunciado.innerHTML = 'Escribe en números romanos el número <strong>' + n + '</strong>. Ejemplo: 42 → XLII.';
        } else {
          const n = randInt(1, 399);
          const rom = aRomano(n);
          actual = { tipo, correcta: String(n), texto: rom + ' = ' + n };
          enunciado.innerHTML = '¿Qué número normal es <strong>' + rom + '</strong>?';
        }
      }

      function verificar(){
        if (!actual) return;
        const entrada = document.getElementById('nr-respuesta').value.trim();
        if (entrada === '') return;
        let esCorrecto = false;
        if (actual.tipo === 'aromano') {
          esCorrecto = entrada.toUpperCase().replace(/\s+/g, '') === actual.correcta;
        } else {
          const n = Number(entrada);
          esCorrecto = Number.isInteger(n) && n === Number(actual.correcta);
        }
        const resultado = document.getElementById('nr-resultado');
        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto! ' + actual.texto + '.';
          resultado.className = 'nr-correcto';
          aciertos++;
        } else {
          resultado.textContent = '❌ Incorrecto. ' + actual.texto + '.';
          resultado.className = 'nr-incorrecto';
          errores++;
        }
        window.MatesCore.puntuar('nr', esCorrecto);
        document.getElementById('nr-aciertos').textContent = aciertos;
        document.getElementById('nr-errores').textContent = errores;

        const historial = document.getElementById('nr-listaHistorial');
        const tu = actual.tipo === 'aromano'
          ? entrada.toUpperCase().replace(/\s+/g, '')
          : entrada;
        const lineas = esCorrecto
          ? ['✅ ' + actual.texto + ' · Tú: ' + tu]
          : ['❌ Tú: ' + (tu || '(vacío)'), '✔️ Correcto: ' + actual.texto];
        historial.prepend(window.MatesCore.itemHistorial(esCorrecto ? 'nr-correcto' : 'nr-incorrecto', lineas));
      }

      document.getElementById('nr-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('nr-verificar').addEventListener('click', function(){ verificar(); });
      document.getElementById('nr-tipo').addEventListener('change', function(){ generar(); });
      generar();
    })();
  