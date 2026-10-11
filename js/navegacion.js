
    (function(){
      function activar(ir){
        document.querySelectorAll('.tab-panel').forEach(function(p){
          p.classList.toggle('active', p.id === 'tab-' + ir);
        });
      }
      function actualizarUrl(ir){
        try {
          var url = new URL(window.location.href);
          if (ir === 'inicio') url.searchParams.delete('modulo');
          else url.searchParams.set('modulo', ir);
          window.history.replaceState(null, '', url.toString());
        } catch (e) {}
      }
      window.irA = function(ir){
        activar(ir);
        actualizarUrl(ir);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      document.getElementById('btn-inicio').addEventListener('click', function(){ irA('inicio'); });

      // Restaura el módulo activo desde la URL (?modulo=...) para no perderlo al recargar (F5)
      try {
        var mod = new URLSearchParams(window.location.search).get('modulo');
        if (mod && document.getElementById('tab-' + mod)) activar(mod);
      } catch (e) {}
    })();
  