
    (function(){
      let actual = null;
      let aciertos = 0;
      let errores = 0;

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      function mcd(a, b){ while (b) { const t = a % b; a = b; b = t; } return a || 1; }
      function mcm(a, b){ return (a / mcd(a, b)) * b; }

      function generar(){
        const tipo = document.getElementById('md-tipo').value;
        document.getElementById('md-resultado').textContent = '';
        document.getElementById('md-resultado').className = '';
        const caja = document.getElementById('md-opciones');
        const enunciado = document.getElementById('md-enunciado');
        actual = null;
        caja.innerHTML = '';

        if (tipo === 'esdivisor') {
          const aciertoResp = Math.random() < 0.5;
          const d = randInt(2, 12);
          let y;
          if (aciertoResp) {
            y = d * randInt(2, 9);
          } else {
            do { y = randInt(d + 1, 98); } while (y % d === 0);
          }
          actual = { tipo, correcta: aciertoResp, texto: (d + ' divide exactamente a ' + y + ' → ' + (aciertoResp ? 'SÍ' : 'NO')) };
          enunciado.innerHTML = '¿Es <strong>' + d + '</strong> un divisor exacto de <strong>' + y + '</strong>?';
          [['SÍ', true], ['NO', false]].forEach(function(op){
            const bot = document.createElement('button');
            bot.type = 'button';
            bot.textContent = op[0];
            bot.addEventListener('click', function(){ elegir(bot, op[1]); });
            caja.appendChild(bot);
          });
        } else {
          const a = randInt(2, 12), b = randInt(2, 12);
          const correcta = tipo === 'mcm' ? mcm(a, b) : mcd(a, b);
          actual = { tipo, correcta, texto: (tipo === 'mcm' ? 'm.c.m.' : 'm.c.d.') + '(' + a + ', ' + b + ') = ' + correcta };
          const palabra = tipo === 'mcm' ? 'mínimo común múltiplo (m.c.m.)' : 'máximo común divisor (m.c.d.)';
          enunciado.innerHTML = 'Calcula el <strong>' + palabra + '</strong> de <strong>' + a + '</strong> y <strong>' + b + '</strong>.';

          const candidatos = [a * b, a + b, Math.abs(a - b), Math.max(a, b), 1, a * b * 2];
          const distractores = [];
          candidatos.forEach(function(v){
            if (v !== correcta && !distractores.includes(v) && distractores.length < 3) distractores.push(v);
          });
          let guard = 0;
          while (distractores.length < 3 && guard < 100) {
            guard++;
            const v = randInt(2, a * b + 10);
            if (v !== correcta && !distractores.includes(v)) distractores.push(v);
          }
          [correcta].concat(distractores).sort(function(){ return Math.random() - 0.5; }).forEach(function(op){
            const bot = document.createElement('button');
            bot.type = 'button';
            bot.textContent = String(op);
            bot.addEventListener('click', function(){ elegir(bot, op); });
            caja.appendChild(bot);
          });
        }
      }

      function elegir(bot, valor){
        if (!actual) return;
        const esCorrecto = valor === actual.correcta;
        const resultado = document.getElementById('md-resultado');
        bot.classList.add(esCorrecto ? 'seleccionada-bien' : 'seleccionada-mal');
        document.getElementById('md-opciones').querySelectorAll('button').forEach(function(b){
          if (b !== bot) b.style.pointerEvents = 'none';
        });
        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto! ' + actual.texto + '.';
          resultado.className = 'md-correcto';
          aciertos++;
        } else {
          resultado.textContent = '❌ Incorrecto. ' + actual.texto + '.';
          resultado.className = 'md-incorrecto';
          errores++;
        }
        window.MatesCore.puntuar('md', esCorrecto);
        document.getElementById('md-aciertos').textContent = aciertos;
        document.getElementById('md-errores').textContent = errores;

        const historial = document.getElementById('md-listaHistorial');
        const elegido = actual.tipo === 'esdivisor'
          ? (valor ? 'SÍ' : 'NO')
          : String(valor);
        const lineas = esCorrecto
          ? ['✅ ' + actual.texto + ' · Tú: ' + elegido]
          : ['❌ Tú: ' + elegido, '✔️ Correcto: ' + actual.texto];
        historial.prepend(window.MatesCore.itemHistorial(esCorrecto ? 'md-correcto' : 'md-incorrecto', lineas));
      }

      document.getElementById('md-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('md-tipo').addEventListener('change', function(){ generar(); });
      generar();
    })();
  