
    (function(){
      const ORDENES = {
        1: 'unidad', 10: 'decena', 100: 'centena',
        1000: 'unidad de millar', 10000: 'decena de millar', 100000: 'centena de millar'
      };
      let numero = 0;
      let orden = 10;
      let correcta = 0;
      let aciertos = 0;
      let errores = 0;
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

      MatesCore.registrarCancelador(cancelarSiguiente);

      function separar(n){
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }

      function generar(){
        cancelarSiguiente();
        respondido = true;
        const cifras = parseInt(document.getElementById('ap-cifras').value, 10);
        const min = Math.pow(10, cifras - 1);
        const max = Math.pow(10, cifras) - 1;
        numero = min + Math.floor(Math.random() * (max - min + 1));

        orden = parseInt(document.getElementById('ap-orden').value, 10);
        if (orden >= Math.pow(10, cifras)) orden = Math.pow(10, cifras - 1);
        const aport = document.getElementById('ap-orden');
        if (aport.value !== String(orden)) aport.value = String(orden);

        correcta = Math.round(numero / orden) * orden;

        const enunciado = document.getElementById('ap-enunciado');
        enunciado.innerHTML = 'Aproxima <strong>' + separar(numero) + '</strong> a la <strong>' + ORDENES[String(orden)] + '</strong>.';

        document.getElementById('ap-respuesta').value = '';
        document.getElementById('ap-resultado').textContent = '';
        document.getElementById('ap-resultado').className = '';
        document.getElementById('ap-respuesta').focus();
        respondido = false;
        inicioPregunta = Date.now();
      }

      function comprobar(){
        if (respondido) return;
        const txt = document.getElementById('ap-respuesta').value.trim();
        if (txt === '') return;
        respondido = true;
        const val = parseFloat(txt.replace(/\s/g, '').replace(',', '.'));
        const esCorrecto = !isNaN(val) && val === correcta;
        const resultado = document.getElementById('ap-resultado');

        if (esCorrecto) {
          resultado.textContent = '✅ ¡Correcto! ' + separar(numero) + ' ≈ ' + separar(correcta) + '.';
          resultado.className = 'ap-correcto';
          aciertos++;
        } else {
          resultado.textContent = '❌ Incorrecto. ' + separar(numero) + ' ≈ ' + separar(correcta) + '.';
          resultado.className = 'ap-incorrecto';
          errores++;
        }
        document.getElementById('ap-aciertos').textContent = aciertos;
        document.getElementById('ap-errores').textContent = errores;

        const lineas = esCorrecto
          ? ['✅ ' + separar(numero) + ' ≈ ' + separar(correcta) + ' · Tú: ' + txt]
          : ['❌ Tú: ' + txt, '✔️ Correcto: ' + separar(numero) + ' ≈ ' + separar(correcta)];
        window.MatesCore.registrar('ap', esCorrecto, lineas, {
          tipo: 'redondeo',
          enunciado: 'Aproxima ' + separar(numero) + ' a la ' + ORDENES[String(orden)],
          respuesta: txt,
          correcta: separar(correcta),
          tiempoMs: Date.now() - inicioPregunta
        });

        programarSiguiente(generar, 2600);
      }

      document.getElementById('ap-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('ap-comprobar').addEventListener('click', function(){ comprobar(); });
      document.getElementById('ap-respuesta').addEventListener('keydown', function(e){ if (e.key === 'Enter') comprobar(); });
      document.getElementById('ap-cifras').addEventListener('change', function(){ generar(); });
      document.getElementById('ap-orden').addEventListener('change', function(){ generar(); });
      generar();
    })();
  