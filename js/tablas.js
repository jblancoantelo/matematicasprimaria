
    (function(){
      let numTabla, numAleatorio;
      let aciertos = 0;
      let errores = 0;
      let modo = '';
      let crActivo = false;
      let crRestantes = 0;
      let crTimer = null;
      let crAciertos = 0;

      const tablaSel = document.getElementById('tm-tabla');
      const respuesta = document.getElementById('tm-respuesta');
      const relojEl = document.getElementById('tm-reloj');

      // Rellenar el selector de tablas (sustituye al antiguo document.write)
      (function(){
        for (let i = 0; i <= 10; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = `Tabla del ${i}`;
          tablaSel.appendChild(opt);
        }
      })();

      function pararContrarreloj(){
        if (crTimer) { clearInterval(crTimer); crTimer = null; }
        crActivo = false;
        relojEl.textContent = '';
      }

      tablaSel.addEventListener('change', function () {
        const v = this.value;
        modo = v === 'aleatorio' ? 'aleatorio' : (v === 'dificil' ? 'dificil' : 'tabla');
        pararContrarreloj();
        tm_generarPregunta();
      });

      respuesta.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') tm_verificar();
      });

      function elegirTabla(){
        if (modo === 'aleatorio') return Math.floor(Math.random() * 11);
        if (modo === 'dificil') return Math.floor(Math.random() * 8) + 2; // 2..9
        const n = parseInt(tablaSel.value, 10);
        return Number.isFinite(n) ? n : 2;
      }

      function elegirMultiplicando(){
        if (modo === 'dificil') return Math.floor(Math.random() * 11) + 2; // 2..12
        return Math.floor(Math.random() * 11);
      }

      window.tm_generarPregunta = function() {
        numTabla = elegirTabla();
        numAleatorio = elegirMultiplicando();

        document.getElementById('tm-pregunta').textContent = `¿Cuánto es ${numTabla} x ${numAleatorio}?`;
        document.getElementById('tm-resultado').textContent = '';
        document.getElementById('tm-resultado').className = '';
        respuesta.value = '';
        respuesta.focus();
      };

      window.tm_verificar = function() {
        if (crActivo && crRestantes <= 0) return;
        const respuestaUsuario = parseInt(respuesta.value);
        if (Number.isNaN(respuestaUsuario)) return;
        const resultadoCorrecto = numTabla * numAleatorio;
        const resultado = document.getElementById('tm-resultado');

        const esCorrecto = respuestaUsuario === resultadoCorrecto;

        window.MatesCore.puntuar('tm', esCorrecto);

        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto!';
          resultado.className = 'tm-correcto';
          aciertos++;
          if (crActivo) crAciertos++;
        } else {
          resultado.textContent = `❌ Incorrecto. La respuesta era ${resultadoCorrecto}.`;
          resultado.className = 'tm-incorrecto';
          errores++;
        }

        document.getElementById('tm-aciertos').textContent = aciertos;
        document.getElementById('tm-errores').textContent = errores;

        // Agregar al historial
        const historial = document.getElementById('tm-listaHistorial');
        const operacion = numTabla + ' × ' + numAleatorio;
        const lineas = esCorrecto
          ? ['✅ ' + operacion + ' = ' + resultadoCorrecto + ' · Tú: ' + respuestaUsuario]
          : ['❌ Tú: ' + operacion + ' = ' + respuestaUsuario,
             '✔️ Correcto: ' + operacion + ' = ' + resultadoCorrecto];
        historial.prepend(window.MatesCore.itemHistorial(esCorrecto ? 'tm-correcto' : 'tm-incorrecto', lineas));

        setTimeout(tm_generarPregunta, crActivo ? 800 : 1500);
      };

      window.tm_iniciarContrarreloj = function() {
        pararContrarreloj();
        let s = parseInt(document.getElementById('tm-segs').value, 10);
        if (!Number.isFinite(s) || s < 5) s = 60;
        if (s > 300) s = 300;
        crRestantes = s;
        crAciertos = 0;
        aciertos = 0;
        errores = 0;
        document.getElementById('tm-aciertos').textContent = 0;
        document.getElementById('tm-errores').textContent = 0;
        document.getElementById('tm-listaHistorial').innerHTML = '';
        crActivo = true;
        relojEl.textContent = `⏱ ${crRestantes}s · Correctas: 0`;
        tm_generarPregunta();
        crTimer = setInterval(function(){
          crRestantes--;
          if (crRestantes <= 0) {
            pararContrarreloj();
            relojEl.textContent = `⏱ ¡Tiempo! ✅ ${crAciertos} correctas`;
            document.getElementById('tm-resultado').textContent = `🕒 ¡Se acabó el tiempo! Respondiste correctamente a ${crAciertos}.`;
            document.getElementById('tm-resultado').className = '';
          } else {
            relojEl.textContent = `⏱ ${crRestantes}s · Correctas: ${crAciertos}`;
          }
        }, 1000);
      };
    })();
  