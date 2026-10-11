
    (function(){
      const STORAGE_KEY = 'problemas_matematicas_primaria_historial_v2';
      const LEGACY_KEY = 'problemas_matematicas_3primaria_historial_v1';

      const opsCountEl = document.getElementById('pr-opsCount');
      const themeEl = document.getElementById('pr-theme');
      const nivelEl = document.getElementById('pr-nivel');
      const generateBtn = document.getElementById('pr-generateBtn');
      const showAnswerBtn = document.getElementById('pr-showAnswerBtn');
      const showMethodBtn = document.getElementById('pr-showMethodBtn');
      const hideBtn = document.getElementById('pr-hideBtn');
      const problemTextEl = document.getElementById('pr-problemText');
      const problemTagEl = document.getElementById('pr-problemTag');
      const answerBox = document.getElementById('pr-answerBox');
      const methodBox = document.getElementById('pr-methodBox');
      const dataList = document.getElementById('pr-dataList');
      const stepsList = document.getElementById('pr-stepsList');
      const studentAnswerEl = document.getElementById('pr-studentAnswer');
      const checkBtn = document.getElementById('pr-checkBtn');
      const feedbackEl = document.getElementById('pr-feedback');
      const historyListEl = document.getElementById('pr-historyList');
      const historyEmptyEl = document.getElementById('pr-historyEmpty');
      const expandAllBtn = document.getElementById('pr-expandAllBtn');
      const collapseAllBtn = document.getElementById('pr-collapseAllBtn');
      const clearHistoryBtn = document.getElementById('pr-clearHistoryBtn');

      let currentProblem = null;
      let currentHistoryId = null;
      let history = [];
      let problemCounter = 0;

      function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
      function choice(arr) { return arr[rand(0, arr.length - 1)]; }
      function pickName() { return choice(['Lucas', 'Sofía', 'Mateo', 'Valeria', 'Hugo', 'Daniela', 'Leo', 'Martina', 'Pablo', 'Lucía']); }
      function withTheme(problemTheme, selectedTheme) { return selectedTheme === 'todos' || selectedTheme === problemTheme; }

      function ajusteDivisible(s2, g, minK, maxK){
        for (let i = 0; i < 300; i++) {
          const k = rand(minK, maxK);
          const e = k * g - s2;
          if (e >= 1) return { e, k };
        }
        const e = (Math.floor(s2 / g) + 1) * g - s2;
        return { e, k: (s2 + e) / g };
      }

      function renderOpsOptions(nivel){
        const max = nivel === 'nivel4' ? 5 : 4;
        const actual = Number(opsCountEl.value) || 2;
        opsCountEl.innerHTML = '';
        for (let i = 1; i <= max; i++) {
          const o = document.createElement('option');
          o.value = i;
          o.textContent = i + (i > 1 ? ' operaciones' : ' operación');
          opsCountEl.appendChild(o);
        }
        opsCountEl.value = actual <= max ? String(actual) : '2';
      }

      function saveHistory() {
        const payload = { history, problemCounter };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }

      function loadHistory() {
        try {
          let raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) raw = localStorage.getItem(LEGACY_KEY); // migrar historial antiguo
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          if (!parsed || !Array.isArray(parsed.history)) return false;
          history = parsed.history.map(item => ({
            index: Number(item.index),
            failed: Boolean(item.failed),
            problem: item.problem
          })).filter(item => item.index && item.problem && item.problem.text && Array.isArray(item.problem.data) && Array.isArray(item.problem.steps));
          problemCounter = Number(parsed.problemCounter) || (history.length ? Math.max(...history.map(item => item.index)) : 0);
          if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          return history.length > 0;
        } catch (error) {
          console.error('No se pudo cargar el historial guardado:', error);
          return false;
        }
      }

      function clearHistory() {
        history = [];
        problemCounter = 0;
        currentHistoryId = null;
        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
      }

      function renderHistory() {
        historyListEl.innerHTML = '';
        if (history.length === 0) {
          historyEmptyEl.style.display = 'block';
          return;
        }
        historyEmptyEl.style.display = 'none';

        history.forEach((item) => {
          const details = document.createElement('details');
          details.className = 'pr-history-item';

          const summary = document.createElement('summary');
          const failedClass = item.failed ? 'pr-summary-line is-failed' : 'pr-summary-line';
          const etiqueta = item.problem.nivel === 'nivel4' ? '4º' : '3º';
          summary.innerHTML = `<span class="${failedClass}">Problema ${item.index} · ${etiqueta}: ${item.problem.text}</span>`;
          details.appendChild(summary);

          const content = document.createElement('div');
          content.className = 'pr-history-content';
          content.innerHTML = `
            <p><strong>Enunciado:</strong> ${item.problem.text}</p>
            <div class="pr-history-grid">
              <div class="pr-mini-box">
                <h4>Datos</h4>
                <ul>${item.problem.data.map(d => `<li>${d}</li>`).join('')}</ul>
              </div>
              <div class="pr-mini-box">
                <h4>Operaciones realizadas</h4>
                <ol>${item.problem.steps.map(s => `<li>${s}</li>`).join('')}</ol>
              </div>
            </div>
            <p><strong>Solución:</strong> ${item.problem.answerText}</p>
            ${item.failed ? '<p><strong style="color:#c0392b;">Este problema tuvo al menos un fallo.</strong></p>' : ''}
            <button type="button" class="pr-btn-light" data-load="${item.index}">Cargar este problema arriba</button>
          `;
          details.appendChild(content);
          historyListEl.appendChild(details);
        });

        historyListEl.querySelectorAll('[data-load]').forEach((button) => {
          button.addEventListener('click', (event) => {
            const index = Number(event.currentTarget.getAttribute('data-load'));
            const found = history.find(item => item.index === index);
            if (found) renderProblem(found.problem, false, found.index);
          });
        });
      }

      function addToHistory(problem) {
        problemCounter += 1;
        const newItem = { index: problemCounter, failed: false, problem };
        history.unshift(newItem);
        if (history.length > 20) history = history.slice(0, 20);
        currentHistoryId = newItem.index;
        saveHistory();
        renderHistory();
      }

      function markCurrentAsFailed() {
        if (currentHistoryId === null) return;
        const item = history.find(entry => entry.index === currentHistoryId);
        if (!item || item.failed) return;
        item.failed = true;
        saveHistory();
        renderHistory();
      }

      function renderProblem(problem, saveInHistory = true, historyId = null) {
        currentProblem = problem;
        currentHistoryId = historyId;
        problemTextEl.textContent = problem.text;
        problemTagEl.textContent = `${problem.label} · ${problem.opsCount} operación${problem.opsCount > 1 ? 'es' : ''} · ${problem.nivel === 'nivel4' ? '4º' : '3º'}`;
        answerBox.classList.add('pr-hidden');
        methodBox.classList.add('pr-hidden');
        answerBox.innerHTML = '';
        dataList.innerHTML = '';
        stepsList.innerHTML = '';
        studentAnswerEl.value = '';
        feedbackEl.textContent = '';
        if (saveInHistory) addToHistory(problem);
      }

      function showAnswer() {
        if (!currentProblem) return;
        answerBox.innerHTML = `<strong>Solución:</strong> ${currentProblem.answerText}`;
        answerBox.classList.remove('pr-hidden');
      }

      function showMethod() {
        if (!currentProblem) return;
        dataList.innerHTML = '';
        stepsList.innerHTML = '';
        currentProblem.data.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          dataList.appendChild(li);
        });
        currentProblem.steps.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          stepsList.appendChild(li);
        });
        methodBox.classList.remove('pr-hidden');
      }

      function hideHelp() {
        answerBox.classList.add('pr-hidden');
        methodBox.classList.add('pr-hidden');
      }

      function checkAnswer() {
        if (!currentProblem) {
          feedbackEl.textContent = 'Primero genera un problema.';
          feedbackEl.style.color = '#b54708';
          return;
        }
        if (studentAnswerEl.value === '') {
          feedbackEl.textContent = 'Escribe una respuesta antes de comprobar.';
          feedbackEl.style.color = '#b54708';
          return;
        }
        const value = Number(studentAnswerEl.value);
        if (value === currentProblem.answer) {
          if (!currentProblem.solvedOnce) { currentProblem.solvedOnce = true; window.MatesCore.puntuar('pr', true); }
          feedbackEl.textContent = '¡Muy bien! La respuesta es correcta. 🎉';
          feedbackEl.style.color = '#18884b';
        } else {
          window.MatesCore.puntuar('pr', false);
          feedbackEl.textContent = 'Todavía no. Inténtalo otra vez o mira la solución.';
          feedbackEl.style.color = '#c0392b';
          markCurrentAsFailed();
        }
      }

      function setAllDetails(open) {
        historyListEl.querySelectorAll('details.pr-history-item').forEach(item => {
          item.open = open;
        });
      }

      expandAllBtn.addEventListener('click', () => setAllDetails(true));
      collapseAllBtn.addEventListener('click', () => setAllDetails(false));
      clearHistoryBtn.addEventListener('click', clearHistory);
      nivelEl.addEventListener('change', () => renderOpsOptions(nivelEl.value));

      const templates = [
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const n=pickName(), a=rand(12,48), b=rand(6,25); return { opsCount:1, theme:'juguetes', label:'Pegatinas', text:`${n} tiene ${a} pegatinas y le regalan ${b} más. ¿Cuántas pegatinas tiene ahora?`, data:[`${n} tiene ${a} pegatinas.`,`Le regalan ${b} pegatinas más.`], steps:[`Sumamos las pegatinas: ${a} + ${b} = ${a+b}.`], answer:a+b, answerText:`${a+b} pegatinas.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const n=pickName(), a=rand(25,70), b=rand(8,24); return { opsCount:1, theme:'colegio', label:'Lápices', text:`${n} tenía ${a} lápices y perdió ${b}. ¿Cuántos lápices le quedan?`, data:[`${n} tenía ${a} lápices.`,`Pierde ${b} lápices.`], steps:[`Restamos los lápices perdidos: ${a} - ${b} = ${a-b}.`], answer:a-b, answerText:`${a-b} lápices.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const c=rand(3,9), q=rand(2,8); return { opsCount:1, theme:'colegio', label:'Cuadernos', text:`En una clase hay ${c} cajas con ${q} cuadernos en cada caja. ¿Cuántos cuadernos hay en total?`, data:[`Hay ${c} cajas.`,`En cada caja hay ${q} cuadernos.`], steps:[`Multiplicamos para saber el total: ${c} × ${q} = ${c*q}.`], answer:c*q, answerText:`${c*q} cuadernos.` }; },
        (theme) => { if (!withTheme('comida', theme) && theme !== 'todos') return null; const n=rand(2,9), por=rand(2,7), t=n*por; return { opsCount:1, theme:'comida', label:'Galletas', text:`Se reparten ${t} galletas entre ${n} niños por igual. ¿Cuántas galletas recibe cada niño?`, data:[`Hay ${t} galletas.`,`Se reparten entre ${n} niños.`], steps:[`Dividimos para repartir por igual: ${t} ÷ ${n} = ${por}.`], answer:por, answerText:`${por} galletas cada niño.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const n=pickName(), tiene=rand(25,80), recibe=rand(10,35), gasta=rand(5,25); return { opsCount:2, theme:'dinero', label:'Dinero', text:`${n} tiene ${tiene} € y recibe ${recibe} € de regalo. Después gasta ${gasta} €. ¿Cuánto dinero le queda?`, data:[`${n} empieza con ${tiene} €.`,`Recibe ${recibe} € más.`,`Gasta ${gasta} €.`], steps:[`Primero sumamos el dinero que recibe: ${tiene} + ${recibe} = ${tiene+recibe}.`,`Después restamos lo que gasta: ${tiene+recibe} - ${gasta} = ${tiene+recibe-gasta}.`], answer:tiene+recibe-gasta, answerText:`${tiene+recibe-gasta} €.` }; },
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const b=rand(3,8), c=rand(4,9), e=rand(5,20); return { opsCount:2, theme:'juguetes', label:'Canicas', text:`${pickName()} tiene ${b} bolsas con ${c} canicas en cada bolsa y además compra ${e} canicas sueltas. ¿Cuántas canicas tiene en total?`, data:[`Tiene ${b} bolsas.`,`Cada bolsa tiene ${c} canicas.`,`Compra ${e} canicas sueltas.`], steps:[`Calculamos las canicas de las bolsas: ${b} × ${c} = ${b*c}.`,`Sumamos las canicas sueltas: ${b*c} + ${e} = ${b*c+e}.`], answer:b*c+e, answerText:`${b*c+e} canicas.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const m=rand(3,8), l=rand(4,9), p=rand(3,14), t=m*l; return { opsCount:2, theme:'colegio', label:'Libros', text:`En la biblioteca del aula hay ${m} mesas con ${l} libros en cada mesa. Si prestan ${p} libros, ¿cuántos libros quedan?`, data:[`Hay ${m} mesas.`,`En cada mesa hay ${l} libros.`,`Se prestan ${p} libros.`], steps:[`Calculamos los libros que había al principio: ${m} × ${l} = ${t}.`,`Restamos los libros prestados: ${t} - ${p} = ${t-p}.`], answer:t-p, answerText:`${t-p} libros.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const a=rand(18,45), personas=choice([2,3,4,5,6]); const totalBase=rand(40,90); const total=totalBase+((personas-(totalBase%personas))%personas); const b=total-a; return { opsCount:2, theme:'dinero', label:'Ahorro y reparto', text:`${pickName()} ahorra ${a} € y su hermano ahorra ${b} €. Después reparten todo el dinero entre ${personas} personas por igual. ¿Cuánto recibe cada persona?`, data:[`Una persona ahorra ${a} €.`,`La otra persona ahorra ${b} €.`,`Se reparte entre ${personas} personas.`], steps:[`Sumamos el dinero ahorrado: ${a} + ${b} = ${total}.`,`Dividimos para repartir por igual: ${total} ÷ ${personas} = ${total/personas}.`], answer:total/personas, answerText:`${total/personas} € cada persona.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const c=rand(3,7), s=rand(4,8), e=rand(6,18), cam=rand(5,20), t=c*s+e-cam; return { opsCount:3, theme:'dinero', label:'Colección y compra', text:`${pickName()} tiene ${c} paquetes con ${s} cromos en cada paquete. Además le regalan ${e} cromos. Luego cambia ${cam} cromos con un amigo. ¿Cuántos cromos le quedan?`, data:[`Tiene ${c} paquetes.`,`Cada paquete tiene ${s} cromos.`,`Le regalan ${e} cromos.`,`Después cambia ${cam} cromos.`], steps:[`Calculamos los cromos de los paquetes: ${c} × ${s} = ${c*s}.`,`Sumamos los cromos regalados: ${c*s} + ${e} = ${c*s+e}.`,`Restamos los cromos que cambia: ${c*s+e} - ${cam} = ${t}.`], answer:t, answerText:`${t} cromos.` }; },
        (theme) => { if (!withTheme('comida', theme) && theme !== 'todos') return null; const b=rand(2,5), m=rand(4,8), n=choice([2,3,4,5,6]); const extraBase=rand(5,15); const totalBase=b*m+extraBase; const total=totalBase+((n-(totalBase%n))%n); const e=total-b*m; return { opsCount:3, theme:'comida', label:'Magdalenas', text:`Para una fiesta hay ${b} bandejas con ${m} magdalenas en cada bandeja y además ${e} magdalenas sueltas. Si se reparten por igual entre ${n} niños, ¿cuántas magdalenas recibe cada niño?`, data:[`Hay ${b} bandejas.`,`Cada bandeja tiene ${m} magdalenas.`,`Además hay ${e} magdalenas sueltas.`,`Se reparte entre ${n} niños.`], steps:[`Calculamos las magdalenas de las bandejas: ${b} × ${m} = ${b*m}.`,`Sumamos las magdalenas sueltas: ${b*m} + ${e} = ${total}.`,`Dividimos para repartir por igual: ${total} ÷ ${n} = ${total/n}.`], answer:total/n, answerText:`${total/n} magdalenas cada niño.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const i=rand(60,120), u=rand(12,28), g=choice([2,3,4,5,6]); const compraBase=rand(10,24); const totalBase=i-u+compraBase; const total=totalBase+((g-(totalBase%g))%g); const c=total-(i-u); return { opsCount:3, theme:'colegio', label:'Folios', text:`En clase había ${i} folios. Se usan ${u} folios para un mural y después se compran ${c} folios más. Si luego reparten todos los folios que quedan en ${g} grupos iguales, ¿cuántos folios recibe cada grupo?`, data:[`Al principio hay ${i} folios.`,`Se usan ${u} folios.`,`Se compran ${c} folios más.`,`Se reparte en ${g} grupos.`], steps:[`Restamos los folios usados: ${i} - ${u} = ${i-u}.`,`Sumamos los folios comprados: ${i-u} + ${c} = ${total}.`,`Dividimos entre los grupos: ${total} ÷ ${g} = ${total/g}.`], answer:total/g, answerText:`${total/g} folios por grupo.` }; },
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const c=rand(3,6), p=rand(4,8), pier=rand(3,10), a=choice([2,3,4,5]); const regaloBase=rand(6,15); const totalBase=c*p+regaloBase-pier; const total=totalBase+((a-(totalBase%a))%a); const r=total-(c*p-pier); return { opsCount:4, theme:'juguetes', label:'Bloques de construcción', text:`${pickName()} tiene ${c} cajas con ${p} bloques en cada caja. Le regalan ${r} bloques más, pero pierde ${pier} bloques. Después reparte todos los bloques entre ${a} amigos por igual. ¿Cuántos bloques recibe cada amigo?`, data:[`Tiene ${c} cajas.`,`Cada caja tiene ${p} bloques.`,`Le regalan ${r} bloques.`,`Pierde ${pier} bloques.`,`Reparte entre ${a} amigos.`], steps:[`Calculamos los bloques de las cajas: ${c} × ${p} = ${c*p}.`,`Sumamos los bloques que le regalan: ${c*p} + ${r} = ${c*p+r}.`,`Restamos los bloques que pierde: ${c*p+r} - ${pier} = ${total}.`,`Dividimos entre ${a} amigos: ${total} ÷ ${a} = ${total/a}.`], answer:total/a, answerText:`${total/a} bloques cada amigo.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const d=rand(3,6), ah=rand(3,8), gasto=rand(4,12), h=choice([2,3,4,5]); const regBase=rand(5,16); const totalBase=d*ah+regBase-gasto; const total=totalBase+((h-(totalBase%h))%h); const r=total-(d*ah-gasto); return { opsCount:4, theme:'dinero', label:'Ahorro semanal', text:`${pickName()} ahorra ${ah} € cada día durante ${d} días. Además recibe ${r} € de regalo y gasta ${gasto} €. Si reparte el dinero que le queda entre ${h} hermanos por igual, ¿cuánto recibe cada hermano?`, data:[`Ahorra ${ah} € cada día.`,`Ahorra durante ${d} días.`,`Recibe ${r} € de regalo.`,`Gasta ${gasto} €.`,`Reparte entre ${h} hermanos.`], steps:[`Calculamos lo que ahorra en total: ${ah} × ${d} = ${ah*d}.`,`Sumamos el dinero del regalo: ${ah*d} + ${r} = ${ah*d+r}.`,`Restamos lo que gasta: ${ah*d+r} - ${gasto} = ${total}.`,`Dividimos entre ${h}: ${total} ÷ ${h} = ${total/h}.`], answer:total/h, answerText:`${total/h} € cada hermano.` }; }
      ];

      const templates4 = [
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const n=pickName(), f=rand(25,40), b=rand(12,24), t=f*b; return { opsCount:1, nivel:'nivel4', theme:'juguetes', label:'Butacas (× 2 cifras)', text:`En el cine la sala tiene ${f} filas y ${b} butacas en cada fila. ¿Cuántas butacas hay en total?`, data:[`Hay ${f} filas.`,`Cada fila tiene ${b} butacas.`], steps:[`Multiplicamos: ${f} × ${b} = ${t}.`], answer:t, answerText:`${t} butacas.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const n=rand(6,12), por=rand(35,90), t=n*por; return { opsCount:1, nivel:'nivel4', theme:'colegio', label:'Libros (división)', text:`Se reparten ${t} libros en ${n} estanterías por igual. ¿Cuántos libros van en cada estantería?`, data:[`Hay ${t} libros.`,`Se reparten en ${n} estanterías.`], steps:[`Dividimos: ${t} ÷ ${n} = ${por}.`], answer:por, answerText:`${por} libros por estantería.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const a=rand(150,450), b=rand(150,450), c=rand(150,450), t=a+b+c; return { opsCount:1, nivel:'nivel4', theme:'dinero', label:'Ahorro (3 sumandos)', text:`${pickName()} ahorra ${a} € en enero, ${b} € en febrero y ${c} € en marzo. ¿Cuánto ha ahorrado en total?`, data:[`Enero: ${a} €.`,`Febrero: ${b} €.`,`Marzo: ${c} €.`], steps:[`Sumamos: ${a} + ${b} + ${c} = ${t}.`], answer:t, answerText:`${t} €.` }; },
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const a=rand(2000,8000), b=rand(400,1500), r=a-b; return { opsCount:1, nivel:'nivel4', theme:'juguetes', label:'Pegatinas (resta 4 cifras)', text:`${pickName()} colecciona ${a} pegatinas y regala ${b} a su prima. ¿Cuántas le quedan?`, data:[`Coleccionaba ${a} pegatinas.`,`Regala ${b} pegatinas.`], steps:[`Restamos: ${a} - ${b} = ${r}.`], answer:r, answerText:`${r} pegatinas.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const n=rand(6,12), q=rand(10,40), r=rand(1,n-1), t=n*q+r; return { opsCount:1, nivel:'nivel4', theme:'colegio', label:'Rotuladores (resto)', text:`Hay ${t} rotuladores que se reparten en ${n} cajas por igual. ¿Cuántos rotuladores sobran?`, data:[`Hay ${t} rotuladores.`,`Se reparten en ${n} cajas.`], steps:[`Dividimos: ${t} ÷ ${n} = ${q} y sobran ${r}.`], answer:r, answerText:`Sobran ${r} rotuladores.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const x=rand(100,300), d=rand(10,40), dias=rand(3,7), gasto=d*dias, r=x-gasto; return { opsCount:2, nivel:'nivel4', theme:'dinero', label:'Gastos diarios', text:`${pickName()} tenía ${x} € y gasta ${d} € cada día durante ${dias} días. ¿Cuánto dinero le queda?`, data:[`Tenía ${x} €.`,`Gasta ${d} € al día.`,`Durante ${dias} días.`], steps:[`Calculamos el gasto total: ${d} × ${dias} = ${gasto}.`,`Restamos lo que gasta: ${x} - ${gasto} = ${r}.`], answer:r, answerText:`${r} €.` }; },
        (theme) => { if (!withTheme('comida', theme) && theme !== 'todos') return null; const c=rand(8,15), q=rand(24,60), t=c*q; return { opsCount:2, nivel:'nivel4', theme:'comida', label:'Huevos', text:`Una granja ha recogido ${t} huevos y los reparte por igual en ${c} cajas. ¿Cuántos huevos van en cada caja?`, data:[`Se recogen ${t} huevos.`,`Hay ${c} cajas.`], steps:[`Comprobamos la multiplicación: ${c} × ${q} = ${t}.`,`Dividimos: ${t} ÷ ${c} = ${q}.`], answer:q, answerText:`${q} huevos por caja.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const n=rand(10,25), p=rand(5,25), coste=n*p, billete=Math.ceil((coste+rand(5,60))/10)*10, cambio=billete-coste; return { opsCount:2, nivel:'nivel4', theme:'colegio', label:'Devolución en el kiosco', text:`${pickName()} compra ${n} cuadernos de ${p} € cada uno y paga con un billete de ${billete} €. ¿Cuánto le devuelven?`, data:[`Compra ${n} cuadernos.`,`Cada cuaderno cuesta ${p} €.`,`Paga con un billete de ${billete} €.`], steps:[`Calculamos el coste: ${n} × ${p} = ${coste}.`,`Restamos lo que le devuelven: ${billete} - ${coste} = ${cambio}.`], answer:cambio, answerText:`${cambio} €.` }; },
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const c=rand(20,60), p=rand(8,15), reg=rand(30,150), tot=c*p+reg, pier=rand(20,120), r=tot-pier; return { opsCount:2, nivel:'nivel4', theme:'juguetes', label:'Canicas (× y −)', text:`${pickName()} tiene ${c} bolsas con ${p} canicas cada una. Le regalan ${reg} canicas más y pierde ${pier} jugando. ¿Cuántas le quedan?`, data:[`Tiene ${c} bolsas.`,`Cada bolsa tiene ${p} canicas.`,`Le regalan ${reg} canicas.`,`Pierde ${pier} canicas.`], steps:[`Canicas de las bolsas y regalo: ${c} × ${p} + ${reg} = ${tot}.`,`Restamos las perdidas: ${tot} - ${pier} = ${r}.`], answer:r, answerText:`${r} canicas.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const a=rand(150,300), g=rand(15,40), dias=rand(3,8), ganaJ=g*dias, gasta=rand(5,20), diario=gasta*dias, r=a+ganaJ-diario; return { opsCount:3, nivel:'nivel4', theme:'dinero', label:'Gana y gasta cada día', text:`${pickName()} tiene ${a} €, gana ${g} € al día durante ${dias} días y gasta ${gasta} € al día. ¿Cuánto tiene al final?`, data:[`Empieza con ${a} €.`,`Gana ${g} € y gasta ${gasta} € al día.`,`Durante ${dias} días.`], steps:[`Gana en total: ${g} × ${dias} = ${ganaJ}.`,`Gasta en total: ${gasta} × ${dias} = ${diario}.`,`Sumamos y restamos: ${a} + ${ganaJ} - ${diario} = ${r}.`], answer:r, answerText:`${r} €.` }; },
        (theme) => { if (!withTheme('colegio', theme) && theme !== 'todos') return null; const p=rand(10,15), s=rand(12,18), base=p*s, g=rand(4,8), k=rand(3,8), v=base-g*k; return { opsCount:3, nivel:'nivel4', theme:'colegio', label:'Lápices para donar', text:`En un aula hay ${p} cajas con ${s} lápices cada una. Se donan ${v} lápices y el resto se reparte en ${g} grupos iguales. ¿Cuántos lápices recibe cada grupo?`, data:[`Hay ${p} cajas.`,`Cada caja tiene ${s} lápices.`,`Se donan ${v} lápices.`,`Se reparte en ${g} grupos.`], steps:[`Lápices en total: ${p} × ${s} = ${base}.`,`Restamos los donados: ${base} - ${v} = ${base-v}.`,`Repartimos: ${base-v} ÷ ${g} = ${k}.`], answer:k, answerText:`${k} lápices por grupo.` }; },
        (theme) => { if (!withTheme('comida', theme) && theme !== 'todos') return null; const c=rand(10,20), r=rand(10,18), base=c*r, m=rand(8,15), d=rand(3,8), uso=m*d, rest=base-uso; return { opsCount:3, nivel:'nivel4', theme:'comida', label:'Melones', text:`Un restaurante compra ${c} cajas de ${r} melones y usa ${m} melones cada día durante ${d} días. ¿Cuántos melones quedan?`, data:[`Compra ${c} cajas.`,`Cada caja tiene ${r} melones.`,`Usa ${m} melones al día.`,`Durante ${d} días.`], steps:[`Melones comprados: ${c} × ${r} = ${base}.`,`Melones usados: ${m} × ${d} = ${uso}.`,`Restamos: ${base} - ${uso} = ${rest}.`], answer:rest, answerText:`${rest} melones.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const a=rand(150,400), c=rand(2,4), p=rand(15,35), g=rand(3,6), base=a-c*p, k=rand(3,12), b=g*k-(base%g), total=base+b; return { opsCount:4, nivel:'nivel4', theme:'dinero', label:'Compra y reparto', text:`${pickName()} tiene ${a} €, recibe ${b} € de regalo y compra ${c} juegos de ${p} € cada uno. Reparte el dinero que le queda entre ${g} amigos por igual. ¿Cuánto recibe cada amigo?`, data:[`Tiene ${a} €.`,`Recibe ${b} € de regalo.`,`Compra ${c} juegos de ${p} €.`,`Reparte en ${g} grupos.`], steps:[`Sumamos el regalo: ${a} + ${b} = ${a+b}.`,`Coste de los juegos: ${c} × ${p} = ${c*p}.`,`Lo que queda: ${a+b} - ${c*p} = ${total}.`,`Repartimos: ${total} ÷ ${g} = ${total/g}.`], answer:total/g, answerText:`${total/g} € por amigo.` }; },
        (theme) => { if (!withTheme('juguetes', theme) && theme !== 'todos') return null; const p=rand(8,15), s=rand(12,25), base1=p*s, reg=rand(40,90), base=base1+reg, g=rand(3,6), k=rand(2,6), menos=base-g*k; return { opsCount:4, nivel:'nivel4', theme:'juguetes', label:'Cromos (reparto 4 pasos)', text:`${pickName()} tiene ${p} cajas con ${s} cromos cada una. Le regalan ${reg} cromos, pierde ${menos} y reparte el resto entre ${g} amigos por igual. ¿Cuántos cromos recibe cada amigo?`, data:[`Tiene ${p} cajas.`,`Cada caja tiene ${s} cromos.`,`Le regalan ${reg} cromos.`,`Pierde ${menos} cromos.`,`Reparte en ${g} grupos.`], steps:[`Cromos de las cajas: ${p} × ${s} = ${base1}.`,`Sumamos el regalo: ${base1} + ${reg} = ${base}.`,`Restamos lo que pierde: ${base} - ${menos} = ${base-menos}.`,`Repartimos: ${base-menos} ÷ ${g} = ${k}.`], answer:k, answerText:`${k} cromos por amigo.` }; },
        (theme) => { if (!withTheme('dinero', theme) && theme !== 'todos') return null; const a=rand(120,250), amigo=rand(5,15), c=rand(2,4), p=rand(8,20), g=rand(3,6), s2=a+amigo-c*p, aj=ajusteDivisible(s2, g, 10, 50), e=aj.e, k=aj.k, total=s2+e; return { opsCount:5, nivel:'nivel4', theme:'dinero', label:'Varios pasos', text:`${pickName()} tiene ${a} € y le pagan ${amigo} € por un recado. Compra ${c} regalos de ${p} € cada uno, encuentra ${e} € en la calle y reparte todo lo que le queda entre ${g} amigos por igual. ¿Cuánto recibe cada amigo?`, data:[`Tiene ${a} €.`,`Le pagan ${amigo} €.`,`Compra ${c} regalos de ${p} €.`,`Encuentra ${e} €.`,`Reparte en ${g} grupos.`], steps:[`Recibe el pago: ${a} + ${amigo} = ${a+amigo}.`,`Coste de los regalos: ${c} × ${p} = ${c*p}.`,`Lo que queda tras comprar: ${a+amigo} - ${c*p} = ${s2}.`,`Suma lo encontrado: ${s2} + ${e} = ${total}.`,`Reparte: ${total} ÷ ${g} = ${k}.`], answer:k, answerText:`${k} € por amigo.` }; }
      ];

      function generateProblem() {
        const nivel = nivelEl.value;
        const opsCount = Number(opsCountEl.value);
        const theme = themeEl.value;
        const fuente = nivel === 'nivel4' ? templates.concat(templates4) : templates;
        let pool = fuente.map(fn => fn(theme)).filter(p => p && p.opsCount === opsCount);
        if (pool.length === 0) pool = fuente.map(fn => fn('todos')).filter(p => p && p.opsCount === opsCount);
        if (pool.length === 0) return;
        pool.forEach(p => { if (!p.nivel) p.nivel = nivel; });
        renderProblem(choice(pool), true);
      }

      generateBtn.addEventListener('click', generateProblem);
      showAnswerBtn.addEventListener('click', showAnswer);
      showMethodBtn.addEventListener('click', showMethod);
      hideBtn.addEventListener('click', hideHelp);
      checkBtn.addEventListener('click', checkAnswer);

      renderOpsOptions(nivelEl.value);
      const hasStoredHistory = loadHistory();
      renderHistory();
      if (hasStoredHistory && history.length > 0) {
        renderProblem(history[0].problem, false, history[0].index);
      } else {
        generateProblem();
      }
    })();
  