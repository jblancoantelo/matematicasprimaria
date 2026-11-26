
    (function(){
      const TIPOS = {
        longitud:  { u:["km","hm","dam","m","dm","cm","mm"], mult:[1000,100,10,1,0.1,0.01,0.001], rango:[1,900], nota:"Cada paso hacia la derecha multiplica ×10 (unidad más pequeña). Cada paso hacia la izquierda divide ÷10 (unidad más grande)." },
        masa:      { u:["kg","hg","dag","g","dg","cg","mg"], mult:[1000,100,10,1,0.1,0.01,0.001], rango:[1,900], nota:"Cada paso hacia la derecha multiplica ×10 (unidad más pequeña). Cada paso hacia la izquierda divide ÷10 (unidad más grande)." },
        capacidad: { u:["kl","hl","dal","l","dl","cl","ml"], mult:[1000,100,10,1,0.1,0.01,0.001], rango:[1,900], nota:"Cada paso hacia la derecha multiplica ×10 (unidad más pequeña). Cada paso hacia la izquierda divide ÷10 (unidad más grande)." },
        tiempo:    { u:["h","min","s"], mult:[3600,60,1], rango:[1,120], nota:"En el tiempo cada paso hacia la derecha multiplica ×60 (1 hora = 60 minutos, 1 minuto = 60 segundos)." }
      };
      const nf = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 });

      const $ = (sel) => document.querySelector(sel);
      const exerciseList = $("#um-exerciseList");
      const scorePill = $("#um-scorePill");

      const genBtn = $("#um-genBtn");
      const checkBtn = $("#um-checkBtn");
      const checkBtn2 = $("#um-checkBtn2");
      const newRoundBtn = $("#um-newRoundBtn");

      const exportCSVBtn = $("#um-exportCSV");
      const clearHistoryBtn = $("#um-clearHistory");
      const historyBox = $("#um-history");

      const toggleHintBtn = $("#um-toggleHintBtn");
      const globalHint = $("#um-globalHint");
      const hintText = $("#um-hintText");
      const tipoSel = $("#um-tipo");
      const ladder = $("#um-ladder");
      const subEl = $("#um-sub");
      let hintVisible = false;

      let tipoActual = "longitud";
      let units = TIPOS.longitud.u;
      let mult = TIPOS.longitud.mult;

      let currentExercises = [];
      let roundStartedAt = null;
      let currentSettings = null;
      let currentHistoryId = null;

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

      function nuevoId(){
        try {
          if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
        } catch (e) {}
        return 'um-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
      }

      function escaparHtml(txt){
        return String(txt == null ? '' : txt)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function leerHistorial(){
        try {
          const datos = JSON.parse(localStorage.getItem('metricHistory') || '[]');
          return Array.isArray(datos) ? datos : [];
        } catch (e) {
          return [];
        }
      }

      function setTipo(t){
        tipoActual = t;
        const tp = TIPOS[t];
        units = tp.u;
        mult = tp.mult;
        ladder.innerHTML = units.map(u => `<div class="um-unit">${u}</div>`).join("");
        hintText.textContent = tp.nota;
        subEl.textContent = `Convierte unidades de ${units[0]} a ${units[units.length-1]}. Ideal para 4º de primaria.`;
      }

      function pickUnits(maxJump){
        const from = randInt(0, units.length-1);
        const allowedIdx = [];
        for(let i=0;i<units.length;i++){
          if(i!==from && Math.abs(i-from) <= maxJump) allowedIdx.push(i);
        }
        const to = allowedIdx[randInt(0, allowedIdx.length-1)];
        return {from, to};
      }

      function makeValue(allowDecimals){
        const rango = TIPOS[tipoActual].rango;
        if(!allowDecimals){
          return randInt(rango[0], rango[1]);
        }
        const base = randInt(rango[0], Math.min(rango[1], 500));
        if(tipoActual === 'tiempo'){
          const pattern = randInt(0,1);
          return pattern === 0 ? base : base + 0.5;
        }
        const pattern = randInt(0,2);
        if(pattern===0) return base + 0.5;
        if(pattern===1) return base + 0.2;
        return base + 0.75;
      }

      function compute(fromIdx, toIdx, value){
        const result = value * mult[fromIdx] / mult[toIdx];
        return Number.parseFloat(result.toFixed(6));
      }

      function fmt(x){ return nf.format(x); }

      function parseNum(s){
        if(s==null) return NaN;
        const t = (""+s).trim().replace(/\s+/g,"").replace(",",".");
        if(t==="") return NaN;
        const n = Number(t);
        return Number.isFinite(n)? n : NaN;
      }

      function renderExercises(list){
        exerciseList.innerHTML = "";
        list.forEach((ex, idx)=>{
          const card = document.createElement("div");
          card.className = "um-ex";
          card.innerHTML = `
            <div>
              <h3>Ejercicio ${idx+1}</h3>
              <div class="um-q">Convierte <strong>${fmt(ex.value)} ${ex.fromU}</strong> a <strong>${ex.toU}</strong>.</div>
            </div>
            <div class="um-right">
              <input type="text" inputmode="decimal" aria-label="Respuesta para el ejercicio ${idx+1}" placeholder="Tu número" id="um-ans-${ex.id}" style="width:130px;" />
              <span class="um-badge">${ex.toU}</span>
              <span id="um-mark-${ex.id}"></span>
            </div>
          `;
          exerciseList.appendChild(card);
        });
      }

      function hayRespuestas(){
        return currentExercises.some(ex => {
          const inp = document.getElementById(`um-ans-${ex.id}`);
          return inp && inp.value.trim() !== '';
        });
      }

      function confirmarNuevaTanda(){
        if (!hayRespuestas()) return true;
        return confirm('Ya hay respuestas escritas en esta tanda. ¿Quieres empezar una nueva?');
      }

      function generate(forzar){
        if (!forzar && !confirmarNuevaTanda()) return;
        const count = Math.max(1, Math.min(50, parseInt($("#um-count").value || "10", 10)));
        let maxJump = Math.max(1, Math.min(6, parseInt($("#um-maxJump").value || "3", 10)));
        if (tipoActual === 'tiempo') maxJump = Math.min(maxJump, 2);
        const allowDecimals = $("#um-decimals").checked;

        currentSettings = { count, maxJump, decimals: allowDecimals, type: tipoActual };
        currentHistoryId = null;
        currentExercises = [];
        for(let i=0;i<count;i++){
          const {from,to} = pickUnits(maxJump);
          const value = makeValue(allowDecimals);
          const correct = compute(from, to, value);
          currentExercises.push({
            id: nuevoId(),
            from, to,
            fromU: units[from], toU: units[to],
            value, correct,
            user: null, ok: null, scored: false
          });
        }
        renderExercises(currentExercises);
        roundStartedAt = Date.now();
        scorePill.style.display = "none";
        checkBtn.disabled = false;
        checkBtn2.disabled = false;
        newRoundBtn.disabled = false;
      }

      function roughlyEqual(a,b){
        const diff = Math.abs(a-b);
        if(diff <= 1e-6) return true;
        const rel = diff / (Math.abs(b)+1e-12);
        return rel < 1e-6;
      }

      function check(){
        if (!currentExercises.length) return;
        let ok = 0;
        currentExercises.forEach(ex=>{
          const inp = document.getElementById(`um-ans-${ex.id}`);
          const mark = document.getElementById(`um-mark-${ex.id}`);
          if (!inp || !mark) return;
          const raw = (inp.value || "").trim();
          if (raw === '') {
            // Sin responder: ni acierto ni error; se puede puntuar más tarde.
            ex.user = '';
            ex.ok = null;
            mark.innerHTML = `<span class="um-small">(sin responder)</span>`;
            return;
          }
          const userVal = parseNum(raw);
          const isOk = Number.isFinite(userVal) && roughlyEqual(userVal, ex.correct);
          ex.user = raw;
          ex.ok = isOk;
          if (isOk) ok++;

          mark.innerHTML = isOk
            ? `<span class="um-ok">✓</span>`
            : `<span class="um-bad">✗</span> <span class="um-small">(${fmt(ex.correct)})</span>`;

          // Cada ejercicio se puntúa una sola vez por tanda.
          if (!ex.scored) {
            ex.scored = true;
            const correcta = fmt(ex.value) + ' ' + ex.fromU + ' = ' + fmt(ex.correct) + ' ' + ex.toU;
            if (isOk) {
              window.MatesCore.registrar('um', true, ['✅ ' + correcta + ' · Tú: ' + raw]);
            } else {
              window.MatesCore.registrar('um', false, ['❌ Tú: ' + raw + ' ' + ex.toU, '✔️ Correcto: ' + correcta]);
            }
          }
        });
        const totalMixto = currentExercises.length;
        scorePill.style.display = "inline-block";
        scorePill.textContent = `Puntuación: ${ok}/${totalMixto}`;
        saveHistory(ok, totalMixto);
      }

      function saveHistory(ok, total){
        const end = Date.now();
        const secs = Math.round((end - (roundStartedAt || end))/1000);
        const settings = currentSettings || {
          count: currentExercises.length,
          maxJump: parseInt($("#um-maxJump").value,10),
          decimals: $("#um-decimals").checked,
          type: tipoActual
        };
        const items = currentExercises.map((ex, i)=>({
          n: i+1,
          from: ex.fromU,
          to: ex.toU,
          value: ex.value,
          user: ex.user,
          correct: ex.correct,
          ok: !!ex.ok
        }));

        const hist = leerHistorial();
        let entry = currentHistoryId ? hist.find(e => e && e.id === currentHistoryId) : null;
        if (!entry) {
          entry = { id: nuevoId(), when: new Date().toISOString() };
          currentHistoryId = entry.id;
          hist.unshift(entry);
        }
        entry.score = { ok, total };
        entry.timeSec = secs;
        entry.settings = settings;
        entry.items = items;

        try {
          localStorage.setItem("metricHistory", JSON.stringify(hist));
        } catch (e) {}
        renderHistory();
      }

      function renderHistory(){
        const hist = leerHistorial();
        if(hist.length===0){
          historyBox.innerHTML = `<p class="um-small">Aún no hay tandas guardadas. Genera y comprueba ejercicios para verlas aquí.</p>`;
          return;
        }
        const parts = hist.map(entry=>{
          if (!entry || !entry.score) return '';
          const date = new Date(entry.when);
          const fechaValida = !isNaN(date.getTime());
          const title = fechaValida
            ? `${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}`
            : 'Tanda sin fecha';
          const scoreTxt = `${Number(entry.score.ok) || 0}/${Number(entry.score.total) || 0}`;
          const ajustes = entry.settings || {};
          const tTipo = (TIPOS[ajustes.type] && TIPOS[ajustes.type].u)
            ? TIPOS[ajustes.type].u.join("–") : "km–mm";
          const setTxt = `${tTipo}, saltos≤${escaparHtml(ajustes.maxJump)}, decimales: ${ajustes.decimals ? 'sí':'no'}, ejercicios: ${escaparHtml(ajustes.count)}`;
          const items = Array.isArray(entry.items) ? entry.items : [];
          const rows = items.map(it=>{
            const userTxt = (it.user == null || it.user === '') ? "<em>(sin respuesta)</em>" : escaparHtml(it.user);
            return `<tr>
              <td>${escaparHtml(it.n)}</td>
              <td>${escaparHtml(fmt(it.value))} ${escaparHtml(it.from)}</td>
              <td>${escaparHtml(it.to)}</td>
              <td>${userTxt}</td>
              <td>${escaparHtml(fmt(it.correct))}</td>
              <td>${it.ok ? "✓" : "✗"}</td>
            </tr>`;
          }).join("");
          return `
            <details class="um-panel" open>
              <summary>${title} — <strong>${scoreTxt}</strong> <span class="um-small">(${setTxt}, tiempo: ${escaparHtml(entry.timeSec)}s)</span></summary>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>De</th><th>A</th><th>Respuesta niño/a</th><th>Correcta</th><th>¿Acertó?</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </details>
          `;
        });
        historyBox.innerHTML = parts.join("");
      }

      function exportCSV(){
        const hist = leerHistorial();
        if(hist.length===0){
          alert("No hay historial para exportar.");
          return;
        }
        const lines = [];
        lines.push([
          "Fecha","Hora","#","De (valor y unidad)","A (unidad)","Respuesta niño/a","Respuesta correcta","¿Acertó?","Tiempo (s)","Ajustes"
        ].join(";"));

        hist.forEach(entry=>{
          if (!entry || !entry.score) return;
          const d = new Date(entry.when);
          const fecha = isNaN(d.getTime()) ? "" : d.toLocaleDateString('es-ES');
          const hora = isNaN(d.getTime()) ? "" : d.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
          const ajustes = entry.settings || {};
          const tTipo = (TIPOS[ajustes.type] && TIPOS[ajustes.type].u)
            ? TIPOS[ajustes.type].u.join("-") : "km-mm";
          const resumen = `${tTipo}, saltos≤${ajustes.maxJump}, decimales=${ajustes.decimals}, ejercicios=${ajustes.count}`;
          (Array.isArray(entry.items) ? entry.items : []).forEach(it=>{
            const deStr = `${nf.format(it.value)} ${it.from}`;
            const aStr = it.to;
            const userStr = (it.user == null ? '' : String(it.user)).replaceAll('"','""');
            const corrStr = nf.format(it.correct);
            const okStr = it.ok ? "SI" : "NO";
            lines.push([
              fecha, hora, it.n, deStr, aStr, `"${userStr}"`, corrStr, okStr, entry.timeSec, `"${resumen}"`
            ].join(";"));
          });
        });

        const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "historial_unidades_metricas.csv";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
      }

      function clearHistory(){
        if(confirm("¿Seguro que quieres borrar TODO el historial de este dispositivo?")){
          localStorage.removeItem("metricHistory");
          renderHistory();
        }
      }

      toggleHintBtn.addEventListener("click", ()=>{
        hintVisible = !hintVisible;
        globalHint.style.display = hintVisible ? "block" : "none";
        toggleHintBtn.textContent = hintVisible ? "💡 Ocultar pista" : "💡 Mostrar pista";
      });

      tipoSel.addEventListener("change", () => {
        if (!confirmarNuevaTanda()) { tipoSel.value = tipoActual; return; }
        setTipo(tipoSel.value);
        generate(true);
      });

      genBtn.addEventListener("click", () => generate(false));
      checkBtn.addEventListener("click", check);
      checkBtn2.addEventListener("click", check);
      newRoundBtn.addEventListener("click", () => generate(false));
      exportCSVBtn.addEventListener("click", exportCSV);
      clearHistoryBtn.addEventListener("click", clearHistory);

      setTipo("longitud");
      renderHistory();
    })();
  