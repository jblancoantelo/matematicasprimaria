
    (function(){
      let numTabla, numAleatorio;
      let aciertos = 0;
      let errores = 0;
      let modo = '';
      let crActivo = false;
      let crRestantes = 0;
      let crTimer = null;
      let crAciertos = 0;
      let crFin = false;
      let respondido = true;
      let timerSiguiente = null;
      let inicioPregunta = 0;

      function cancelarSiguiente(){
        if (timerSiguiente) { clearTimeout(timerSiguiente); timerSiguiente = null; }
      }

      function programarSiguiente(fn, ms){
        cancelarSiguiente();
        timerSiguiente = setTimeout(function(){ timerSiguiente = null; fn(); }, ms);
      }

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

      function pararContrarreloj(fin){
        if (crTimer) { clearInterval(crTimer); crTimer = null; }
        crActivo = false;
        crFin = !!fin;
        relojEl.textContent = '';
        cancelarSiguiente();
      }

      MatesCore.registrarCancelador(function(){
        cancelarSiguiente();
        if (crActivo) pararContrarreloj();
        crFin = false;
      });

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
        cancelarSiguiente();
        respondido = false;
        numTabla = elegirTabla();
        numAleatorio = elegirMultiplicando();

        document.getElementById('tm-pregunta').textContent = `¿Cuánto es ${numTabla} x ${numAleatorio}?`;
        document.getElementById('tm-resultado').textContent = '';
        document.getElementById('tm-resultado').className = '';
        respuesta.value = '';
        respuesta.focus();
        inicioPregunta = Date.now();
      };

      window.tm_verificar = function() {
        if (respondido) return;
        if (crFin) return;
        if (crActivo && crRestantes <= 0) return;
        const respuestaUsuario = parseInt(respuesta.value);
        if (Number.isNaN(respuestaUsuario)) return;
        respondido = true;
        const resultadoCorrecto = numTabla * numAleatorio;
        const resultado = document.getElementById('tm-resultado');

        const esCorrecto = respuestaUsuario === resultadoCorrecto;

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
        const operacion = numTabla + ' × ' + numAleatorio;
        const lineas = esCorrecto
          ? ['✅ ' + operacion + ' = ' + resultadoCorrecto + ' · Tú: ' + respuestaUsuario]
          : ['❌ Tú: ' + operacion + ' = ' + respuestaUsuario,
             '✔️ Correcto: ' + operacion + ' = ' + resultadoCorrecto];
        window.MatesCore.registrar('tm', esCorrecto, lineas, {
          tipo: modo,
          enunciado: '¿Cuánto es ' + numTabla + ' x ' + numAleatorio + '?',
          respuesta: String(respuestaUsuario),
          correcta: String(resultadoCorrecto),
          tiempoMs: Date.now() - inicioPregunta
        });

        programarSiguiente(tm_generarPregunta, crActivo ? 800 : 1500);
      };

      window.tm_iniciarContrarreloj = function() {
        pararContrarreloj();
        crFin = false;
        let s = parseInt(document.getElementById('tm-segs').value, 10);
        if (!Number.isFinite(s) || s < 5) s = 60;
        if (s > 300) s = 300;
        crRestantes = s;
        crAciertos = 0;
        crActivo = true;
        relojEl.textContent = `⏱ ${crRestantes}s · Correctas: 0`;
        tm_generarPregunta();
        crTimer = setInterval(function(){
          crRestantes--;
          if (crRestantes <= 0) {
            pararContrarreloj(true);
            relojEl.textContent = `⏱ ¡Tiempo! ✅ ${crAciertos} correctas`;
            document.getElementById('tm-resultado').textContent = `🕒 ¡Se acabó el tiempo! Respondiste correctamente a ${crAciertos}.`;
            document.getElementById('tm-resultado').className = '';
          } else {
            relojEl.textContent = `⏱ ${crRestantes}s · Correctas: ${crAciertos}`;
          }
        }, 1000);
      };
    })();
  