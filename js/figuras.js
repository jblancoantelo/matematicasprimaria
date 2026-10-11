
    (function(){
      let actual = null;
      let aciertos = 0;
      let errores = 0;

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      function parseNum(s){
        if (s == null) return NaN;
        const t = ('' + s).trim().replace(/\s+/g, '').replace(',', '.');
        const n = Number(t);
        return Number.isFinite(n) ? n : NaN;
      }

      function mostrarFiguras(){ return document.getElementById('tab-figuras').classList.contains('active'); }

      document.addEventListener('keydown', function(e){
        if (e.key === 'Enter' && mostrarFiguras()) verificar();
      });

      function svgRect(a, b, conCuadraditos){
        const u = 26;
        const w = a * u, h = b * u;
        let grid = '';
        for (let i = 1; i < a; i++) grid += `<line x1="${i*u}" y1="0" x2="${i*u}" y2="${h}" stroke="#cbd5e1" stroke-width="1"/>`;
        for (let j = 1; j < b; j++) grid += `<line x1="0" y1="${j*u}" x2="${w}" y2="${j*u}" stroke="#cbd5e1" stroke-width="1"/>`;
        const ancho = Math.min(w, 350), alto = Math.min(h, 350);
        return `<svg class="pa-svg" viewBox="0 0 ${w} ${h}" width="${ancho}" height="${alto}" style="max-width:100%">
          <rect x="0" y="0" width="${w}" height="${h}" fill="#fde68a" stroke="#f59e0b" stroke-width="4"/>
          ${grid}
        </svg>
        ${conCuadraditos ? `<p>El rectángulo tiene <strong>${a} × ${b} = ${a*b}</strong> cuadraditos.</p>` : ''}`;
      }

      function generar(){
        const tipo = document.getElementById('pa-tipo').value;
        document.getElementById('pa-resultado').textContent = '';
        document.getElementById('pa-resultado').className = '';
        document.getElementById('pa-respuesta').value = '';
        actual = null;

        const esCuadrado = Math.random() < 0.35;
        const a = randInt(2, 9);
        const b = esCuadrado ? a : randInt(2, 12);
        const correcta = tipo === 'perimetro' ? 2 * (a + b) : a * b;
        actual = { tipo, correcta, texto: (tipo === 'perimetro' ? 'Perímetro = ' : 'Área = ') + correcta };

        document.getElementById('pa-visual').innerHTML = svgRect(a, b, tipo === 'perimetro');
        const figura = esCuadrado ? '<strong>cuadrado</strong> mide ' + a + ' cm de ' + ((tipo === 'perimetro') ? 'lado' : 'lado') : '<strong>rectángulo</strong> mide ' + a + ' cm de largo y ' + b + ' cm de alto';
        document.getElementById('pa-enunciado').innerHTML =
          'Un ' + figura + '.' +
          (tipo === 'perimetro' ? '<br>¿Cuál es su <strong>perímetro</strong> (en cm)?' : '<br>¿Cuál es su <strong>área</strong> (en cm²)?');
      }

      function verificar(){
        if (!actual) return;
        const entrada = document.getElementById('pa-respuesta').value.trim();
        if (entrada === '') return;
        const valor = parseNum(entrada);
        const esCorrecto = Number.isFinite(valor) && Math.abs(valor - actual.correcta) < 1e-9;
        const resultado = document.getElementById('pa-resultado');
        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto! ' + actual.texto + '.';
          resultado.className = 'pa-correcto';
          aciertos++;
        } else {
          resultado.textContent = '❌ Incorrecto. ' + actual.texto + '.';
          resultado.className = 'pa-incorrecto';
          errores++;
        }
        window.MatesCore.puntuar('pa', esCorrecto);
        document.getElementById('pa-aciertos').textContent = aciertos;
        document.getElementById('pa-errores').textContent = errores;

        const historial = document.getElementById('pa-listaHistorial');
        const li = document.createElement('li');
        li.className = esCorrecto ? 'pa-correcto' : 'pa-incorrecto';
        li.textContent = actual.texto + ' — respondido: ' + (entrada || '(vacío)') + (esCorrecto ? ' ✅' : '');
        historial.prepend(li);
      }

      document.getElementById('pa-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('pa-verificar').addEventListener('click', function(){ verificar(); });
      document.getElementById('pa-tipo').addEventListener('change', function(){ generar(); });
      generar();
    })();
  