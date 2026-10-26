
    (function(){
      let actual = null;
      let aciertos = 0;
      let errores = 0;

      function mostrarDecimales(){ return document.getElementById('tab-decimales').classList.contains('active'); }

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      function parseNum(s){
        if (s == null) return NaN;
        const t = ('' + s).trim().replace(/\s+/g, '').replace(',', '.');
        if (t === '') return NaN;
        const n = Number(t);
        return Number.isFinite(n) ? n : NaN;
      }

      function roughlyEqual(a, b){
        const diff = Math.abs(a - b);
        if (diff <= 1e-6) return true;
        return diff / (Math.abs(b) + 1e-12) < 1e-6;
      }

      function fmtEuro(x){ return x.toFixed(2).replace('.', ',') + ' €'; }
      function fmtNum(x){ return ('' + x).replace('.', ','); }

      document.addEventListener('keydown', function(e){
        if (e.key === 'Enter' && mostrarDecimales()) verificar();
      });

      document.getElementById('de-generar').addEventListener('click', generar);
      document.getElementById('de-verificar').addEventListener('click', verificar);
      document.getElementById('de-tipo').addEventListener('change', function(){ generar(); });

      function generar(){
        const tipo = document.getElementById('de-tipo').value;
        document.getElementById('de-resultado').textContent = '';
        document.getElementById('de-resultado').className = '';
        document.getElementById('de-respuesta').value = '';
        actual = null;

        const visual = document.getElementById('de-visual');
        const enunciado = document.getElementById('de-enunciado');

        if (tipo === 'cuadricula') {
          const n = randInt(1, 99);
          let cells = '';
          for (let i = 0; i < 100; i++) cells += `<div class="de-cell${i < n ? ' de-llena' : ''}"></div>`;
          visual.innerHTML = `<div class="de-grid">${cells}</div>`;
          actual = { tipo, correcta: n / 100, texto: `${n} de 100 = ${fmtNum((n / 100).toFixed(2))}`, etiqueta: 'cuadrícula' };
          enunciado.innerHTML = `Se han coloreado <strong>${n} de 100</strong> celdas. ¿Qué número decimal representa la parte coloreada?`;
        } else if (tipo === 'centimos') {
          const c = randInt(1, 999);
          const modo = randInt(0, 1);
          visual.innerHTML = '';
          if (modo === 0) {
            actual = { tipo, correcta: c, texto: `${c} céntimos`, etiqueta: 'céntimos' };
            enunciado.innerHTML = `¿Cuántos céntimos son <strong>${fmtEuro(c / 100)}</strong>?`;
          } else {
            actual = { tipo, correcta: c / 100, texto: `${fmtEuro(c / 100)}`, etiqueta: 'euros' };
            enunciado.innerHTML = `¿Cuántos euros son <strong>${c} céntimos</strong>? Escribe el número, por ejemplo ${fmtNum((c / 100).toFixed(2))}.`;
          }
        } else if (tipo === 'suma') {
          const ca = randInt(12, 990);
          const cb = randInt(12, 985);
          visual.innerHTML = '';
          actual = { tipo, correcta: (ca + cb) / 100, texto: `${fmtEuro(ca / 100)} + ${fmtEuro(cb / 100)} = ${fmtEuro((ca + cb) / 100)}`, etiqueta: 'suma' };
          enunciado.innerHTML = `¿Cuánto es <strong>${fmtEuro(ca / 100)} + ${fmtEuro(cb / 100)}</strong>?`;
        } else if (tipo === 'cambio') {
          const precio = randInt(50, 990);
          const paga = precio <= 500 ? 5 : (precio <= 900 ? 10 : 20);
          visual.innerHTML = '';
          actual = { tipo, correcta: paga - precio / 100, texto: `${fmtEuro(paga)} - ${fmtEuro(precio / 100)} = ${fmtEuro(paga - precio / 100)}`, etiqueta: 'devolución' };
          enunciado.innerHTML = `Una compra cuesta <strong>${fmtEuro(precio / 100)}</strong> y pagas con <strong>${fmtEuro(paga)}</strong>. ¿Cuánto te devuelven?`;
        }
      }

      function verificar(){
        if (!actual) return;
        const entrada = document.getElementById('de-respuesta').value.trim();
        if (entrada === '') return;
        const valor = parseNum(entrada);
        const esCorrecto = Number.isFinite(valor) && roughlyEqual(valor, actual.correcta);
        const resultado = document.getElementById('de-resultado');

        window.MatesCore.puntuar('de', esCorrecto);
        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto!';
          resultado.className = 'de-correcto';
          aciertos++;
        } else {
          resultado.textContent = `❌ Incorrecto. La respuesta era ${actual.texto}.`;
          resultado.className = 'de-incorrecto';
          errores++;
        }

        document.getElementById('de-aciertos').textContent = aciertos;
        document.getElementById('de-errores').textContent = errores;

        const historial = document.getElementById('de-listaHistorial');
        const lineas = esCorrecto
          ? ['✅ ' + actual.texto + ' · Tú: ' + entrada]
          : ['❌ Tú: ' + entrada, '✔️ Correcto: ' + actual.texto];
        historial.prepend(window.MatesCore.itemHistorial(esCorrecto ? 'de-correcto' : 'de-incorrecto', lineas));
      }
    })();
  