
    (function(){
      let actual = null;
      let aciertos = 0;
      let errores = 0;

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      function fmtHora(h, m){ return h + ':' + (m < 10 ? '0' : '') + m; }

      function svgReloj(h, m){
        const cx = 100, cy = 100;
        let ticks = '';
        for (let i = 0; i < 12; i++) {
          const ang = i * 30;
          const a = (ang - 90) * Math.PI / 180;
          const x1 = cx + Math.cos(a) * 84, y1 = cy + Math.sin(a) * 84;
          const x2 = cx + Math.cos(a) * 92, y2 = cy + Math.sin(a) * 92;
          ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#334155" stroke-width="3"/>`;
        }
        const numeros = [[12,100,36],[3,170,107],[6,100,174],[9,30,107]];
        let nums = '';
        numeros.forEach(function(nm){
          nums += `<text x="${nm[1]}" y="${nm[2]}" text-anchor="middle" font-size="19" font-weight="700" fill="#0f172a">${nm[0]}</text>`;
        });
        const hAng = (h % 12) * 30 + m * 0.5;
        const mAng = m * 6;
        function punto(r, deg){
          const a = (deg - 90) * Math.PI / 180;
          return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        }
        const hp = punto(42, hAng), mp = punto(66, mAng);
        return `<svg class="re-modulo-svg" viewBox="0 0 200 200" width="230" height="230">
          <circle cx="100" cy="100" r="94" fill="#fff" stroke="#334155" stroke-width="5"/>
          ${ticks}${nums}
          <line x1="100" y1="100" x2="${hp[0].toFixed(1)}" y2="${hp[1].toFixed(1)}" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
          <line x1="100" y1="100" x2="${mp[0].toFixed(1)}" y2="${mp[1].toFixed(1)}" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
          <circle cx="100" cy="100" r="6" fill="#dc2626"/>
        </svg>`;
      }

      function opcionesMulti(correcta){
        const usadas = {};
        usadas[correcta] = true;
        const distractores = [];
        const partes = correcta.split(':');
        const h = parseInt(partes[0], 10), m = parseInt(partes[1], 10);
        const cambios = [[-1,0],[1,0],[0,5],[0,25],[-1,5],[1,25],[-2,0],[0,35]];
        for (let i = 0; i < cambios.length && distractores.length < 3; i++) {
          let nh = h + cambios[i][0], nm = m + cambios[i][1];
          while (nm < 0) { nm += 60; nh--; }
          while (nm >= 60) { nm -= 60; nh++; }
          while (nh <= 0) { nh += 12; }
          while (nh > 12) { nh -= 12; }
          const cand = fmtHora(nh, nm);
          if (!usadas[cand]) { usadas[cand] = true; distractores.push(cand); }
        }
        let guard = 0;
        while (distractores.length < 3 && guard < 100) {
          guard++;
          const cand = fmtHora(randInt(1, 12), ((randInt(0, 11) * 5) % 60).toString().padStart(2, '0'));
          if (!usadas[cand]) { usadas[cand] = true; distractores.push(cand); }
        }
        return [correcta].concat(distractores).sort(() => Math.random() - 0.5);
      }

      function generar(){
        const tipo = document.getElementById('re-tipo').value;
        document.getElementById('re-resultado').textContent = '';
        document.getElementById('re-resultado').className = '';
        const visual = document.getElementById('re-visual');
        const enunciado = document.getElementById('re-enunciado');
        const caja = document.getElementById('re-opciones');
        actual = null;
        caja.innerHTML = '';

        let h, m, correcta;
        if (tipo === 'leer') {
          h = randInt(1, 12);
          m = (randInt(0, 11) * 5) % 60;
          correcta = fmtHora(h, m);
          enunciado.innerHTML = '¿Qué hora marca el reloj?';
        } else {
          h = randInt(1, 11);
          m = (randInt(0, 11) * 5) % 60;
          const add = randInt(1, 6) * 5;
          const tot = h * 60 + m + add;
          const nh = (Math.floor(tot / 60) % 12) || 12;
          const nm = tot % 60;
          correcta = fmtHora(nh, nm);
          enunciado.innerHTML = `El reloj marca las <strong>${fmtHora(h, m)}</strong>. ¿Qué hora será <strong>dentro de ${add} minutos</strong>?`;
        }
        visual.innerHTML = svgReloj(h, m);
        actual = { correcta, texto: correcta };

        opcionesMulti(correcta).forEach(function(op){
          const bot = document.createElement('button');
          bot.type = 'button';
          bot.textContent = op;
          bot.addEventListener('click', function(){ elegir(bot, op); });
          caja.appendChild(bot);
        });
      }

      function elegir(bot, valor){
        if (!actual) return;
        const esCorrecto = valor === actual.correcta;
        const resultado = document.getElementById('re-resultado');
        bot.classList.add(esCorrecto ? 'seleccionada-bien' : 'seleccionada-mal');
        document.getElementById('re-opciones').querySelectorAll('button').forEach(function(b){
          if (b !== bot) b.style.pointerEvents = 'none';
        });
        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto! Son las ' + actual.correcta + '.';
          resultado.className = 're-correcto';
          aciertos++;
        } else {
          resultado.textContent = '❌ Incorrecto. Son las ' + actual.correcta + '.';
          resultado.className = 're-incorrecto';
          errores++;
        }
        window.MatesCore.puntuar('re', esCorrecto);
        document.getElementById('re-aciertos').textContent = aciertos;
        document.getElementById('re-errores').textContent = errores;
      }

      document.getElementById('re-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('re-tipo').addEventListener('change', function(){ generar(); });
      generar();
    })();
  