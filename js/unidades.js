
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

      function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

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
              <div class="um-q">Convierte <strong>${fmt(ex.value)} ${units[ex.from]}</strong> a <strong>${units[ex.to]}</strong>.</div>
            </div>
            <div class="um-right">
              <input type="text" inputmode="decimal" aria-label="Respuesta para el ejercicio ${idx+1}" placeholder="Tu número" id="um-ans-${ex.id}" style="width:130px;" />
              <span class="um-badge">${units[ex.to]}</span>
              <span id="um-mark-${ex.id}"></span>
            </div>
          `;
          exerciseList.appendChild(card);
        });
      }

      function generate(){
        const count = Math.max(1, Math.min(50, parseInt($("#um-count").value || "10", 10)));
        let maxJump = Math.max(1, Math.min(6, parseInt($("#um-maxJump").value || "3", 10)));
        if (tipoActual === 'tiempo') maxJump = Math.min(maxJump, 2);
        const allowDecimals = $("#um-decimals").checked;

        currentExercises = [];
        for(let i=0;i<count;i++){
          const {from,to} = pickUnits(maxJump);
          const value = makeValue(allowDecimals);
          const correct = compute(from, to, value);
          currentExercises.push({
            id: crypto.randomUUID(),
            from, to, value, correct,
            user: null, ok: null
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
        let ok = 0;
        currentExercises.forEach(ex=>{
          const inp = document.getElementById(`um-ans-${ex.id}`);
          const mark = document.getElementById(`um-mark-${ex.id}`);
          const userVal = parseNum(inp.value);
          ex.user = (inp.value || "").trim();
          if(Number.isNaN(userVal)){
            ex.ok = false;
            mark.innerHTML = `<span class="um-bad">✗</span> <span class="um-small">(${fmt(ex.correct)})</span>`;
            window.MatesCore.puntuar('um', false);
          }else{
            const isOk = roughlyEqual(userVal, ex.correct);
            ex.ok = isOk;
            window.MatesCore.puntuar('um', isOk);
            if(isOk){
              ok++;
              mark.innerHTML = `<span class="um-ok">✓</span>`;
            }else{
              mark.innerHTML = `<span class="um-bad">✗</span> <span class="um-small">(${fmt(ex.correct)})</span>`;
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
        const settings = {
          count: currentExercises.length,
          maxJump: parseInt($("#um-maxJump").value,10),
          decimals: $("#um-decimals").checked,
          type: tipoActual
        };
        const items = currentExercises.map((ex, i)=>({
          n: i+1,
          from: units[ex.from],
          to: units[ex.to],
          value: ex.value,
          user: ex.user,
          correct: ex.correct,
          ok: !!ex.ok
        }));
        const entry = {
          id: crypto.randomUUID(),
          when: new Date().toISOString(),
          score: { ok, total },
          timeSec: secs,
          settings,
          items
        };
        const key = "metricHistory";
        const hist = JSON.parse(localStorage.getItem(key) || "[]");
        hist.unshift(entry);
        localStorage.setItem(key, JSON.stringify(hist));
        renderHistory();
      }

      function renderHistory(){
        const key = "metricHistory";
        const hist = JSON.parse(localStorage.getItem(key) || "[]");
        if(hist.length===0){
          historyBox.innerHTML = `<p class="um-small">Aún no hay tandas guardadas. Genera y comprueba ejercicios para verlas aquí.</p>`;
          return;
        }
        const parts = hist.map(entry=>{
          const date = new Date(entry.when);
          const title = `${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}`;
          const scoreTxt = `${entry.score.ok}/${entry.score.total}`;
          const tTipo = (entry.settings && TIPOS[entry.settings.type] && TIPOS[entry.settings.type].u) 
            ? TIPOS[entry.settings.type].u.join("–") : "km–mm";
          const setTxt = `${tTipo}, saltos≤${entry.settings.maxJump}, decimales: ${entry.settings.decimals ? 'sí':'no'}, ejercicios: ${entry.settings.count}`;
          const rows = entry.items.map(it=>{
            const userParsed = it.user?.replaceAll('"','""') ?? "";
            return `<tr>
              <td>${it.n}</td>
              <td>${fmt(it.value)} ${it.from}</td>
              <td>${it.to}</td>
              <td>${userParsed || "<em>(sin respuesta)</em>"}</td>
              <td>${fmt(it.correct)}</td>
              <td>${it.ok ? "✓" : "✗"}</td>
            </tr>`;
          }).join("");
          return `
            <details class="um-panel" open>
              <summary>${title} — <strong>${scoreTxt}</strong> <span class="um-small">(${setTxt}, tiempo: ${entry.timeSec}s)</span></summary>
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
        const key = "metricHistory";
        const hist = JSON.parse(localStorage.getItem(key) || "[]");
        if(hist.length===0){
          alert("No hay historial para exportar.");
          return;
        }
        const lines = [];
        lines.push([
          "Fecha","Hora","#","De (valor y unidad)","A (unidad)","Respuesta niño/a","Respuesta correcta","¿Acertó?","Tiempo (s)","Ajustes"
        ].join(";"));

        hist.forEach(entry=>{
          const d = new Date(entry.when);
          const fecha = d.toLocaleDateString('es-ES');
          const hora = d.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
          const tTipo = (entry.settings && TIPOS[entry.settings.type] && TIPOS[entry.settings.type].u)
            ? TIPOS[entry.settings.type].u.join("-") : "km-mm";
          const ajustes = `${tTipo}, saltos≤${entry.settings.maxJump}, decimales=${entry.settings.decimals}, ejercicios=${entry.settings.count}`;
          entry.items.forEach(it=>{
            const deStr = `${nf.format(it.value)} ${it.from}`;
            const aStr = it.to;
            const userStr = (it.user ?? "").replaceAll('"','""');
            const corrStr = nf.format(it.correct);
            const okStr = it.ok ? "SI" : "NO";
            lines.push([
              fecha, hora, it.n, deStr, aStr, `"${userStr}"`, corrStr, okStr, entry.timeSec, `"${ajustes}"`
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

      tipoSel.addEventListener("change", () => setTipo(tipoSel.value));

      genBtn.addEventListener("click", generate);
      checkBtn.addEventListener("click", check);
      checkBtn2.addEventListener("click", check);
      newRoundBtn.addEventListener("click", generate);
      exportCSVBtn.addEventListener("click", exportCSV);
      clearHistoryBtn.addEventListener("click", clearHistory);

      setTipo("longitud");
      renderHistory();
    })();
  