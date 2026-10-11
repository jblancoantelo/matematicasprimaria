
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

      function separar(n){
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }

      function generar(){
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
      }

      function comprobar(){
        const txt = document.getElementById('ap-respuesta').value.trim();
        if (txt === '') return;
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
        window.MatesCore.puntuar('ap', esCorrecto);

        document.getElementById('ap-aciertos').textContent = aciertos;
        document.getElementById('ap-errores').textContent = errores;

        const historial = document.getElementById('ap-listaHistorial');
        const li = document.createElement('li');
        li.className = esCorrecto ? 'ap-correcto' : 'ap-incorrecto';
        li.textContent = separar(numero) + ' ≈ ' + separar(correcta) + ' → ' + txt + (esCorrecto ? ' ✅' : '');
        historial.prepend(li);

        setTimeout(generar, 2600);
      }

      document.getElementById('ap-generar').addEventListener('click', function(){ generar(); });
      document.getElementById('ap-comprobar').addEventListener('click', function(){ comprobar(); });
      document.getElementById('ap-respuesta').addEventListener('keydown', function(e){ if (e.key === 'Enter') comprobar(); });
      document.getElementById('ap-cifras').addEventListener('change', function(){ generar(); });
      document.getElementById('ap-orden').addEventListener('change', function(){ generar(); });
      generar();
    })();
  