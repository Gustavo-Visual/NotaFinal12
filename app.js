/* ============================================
   Grade Calculator – 12º Ano
   Dual Theme Edition
   ============================================ */

(() => {
    "use strict";

    // ── DOM ────────────────────────────────────
    const html          = document.documentElement;
    const themeToggle   = document.getElementById("themeToggle");
    const themeIcon     = document.getElementById("themeIcon");
    const tabCalc       = document.getElementById("tabCalc");
    const tabSim        = document.getElementById("tabSim");
    const tabIndicator  = document.getElementById("tabIndicator");
    const calculateMode = document.getElementById("calculateMode");
    const simulateMode  = document.getElementById("simulateMode");
    const resultPanel   = document.getElementById("resultPanel");
    const resultBreak   = document.getElementById("resultBreakdown");
    const resultMsg     = document.getElementById("resultMsg");
    const bigNum        = document.getElementById("bigNum");
    const bigDec        = document.getElementById("bigDec");
    const resultBarFill = document.getElementById("resultBarFill");

    // Calculate inputs
    const inputSubjects   = document.getElementById("inputSubjects");
    const inputInternship = document.getElementById("inputInternship");
    const inputPAP        = document.getElementById("inputPAP");

    // Bars
    const barSubjects     = document.getElementById("barSubjects");
    const barInternship   = document.getElementById("barInternship");
    const barPAP          = document.getElementById("barPAP");
    const simBarSubjects  = document.getElementById("simBarSubjects");
    const simBarInternship= document.getElementById("simBarInternship");
    const simBarPAP       = document.getElementById("simBarPAP");

    // Simulate inputs
    const inputGoal       = document.getElementById("inputGoal");
    const simSubjects     = document.getElementById("simSubjects");
    const simInternship   = document.getElementById("simInternship");
    const simPAP          = document.getElementById("simPAP");

    let mode = "calculate";

    // ── Theme System ──────────────────────────
    const THEMES = ["epromat", "criativo"];
    const THEME_LABELS = { epromat: "🏫", criativo: "🎨" };

    // Load saved theme or default
    let currentTheme = localStorage.getItem("nota-final-theme") || "epromat";
    applyTheme(currentTheme);

    themeToggle.addEventListener("click", () => {
        const idx = THEMES.indexOf(currentTheme);
        currentTheme = THEMES[(idx + 1) % THEMES.length];
        applyTheme(currentTheme);
        localStorage.setItem("nota-final-theme", currentTheme);
    });

    function applyTheme(theme) {
        html.setAttribute("data-theme", theme);
        // Show the OTHER theme's icon as hint for what you'll switch TO
        const nextIdx = (THEMES.indexOf(theme) + 1) % THEMES.length;
        themeIcon.textContent = THEME_LABELS[THEMES[nextIdx]];
        themeToggle.title = theme === "epromat"
            ? "Mudar para tema Criativo"
            : "Mudar para tema EPROMAT";
    }

    // ── Mode Switching ────────────────────────
    tabCalc.addEventListener("click", () => setMode("calculate"));
    tabSim.addEventListener("click",  () => setMode("simulate"));

    function setMode(m) {
        mode = m;
        tabCalc.classList.toggle("active", m === "calculate");
        tabSim.classList.toggle("active",  m === "simulate");
        tabIndicator.classList.toggle("right", m === "simulate");

        calculateMode.classList.toggle("hidden", m !== "calculate");
        simulateMode.classList.toggle("hidden",  m !== "simulate");

        hideResult();
        recalc();
    }

    // ── Input Listeners ───────────────────────
    const calcInputs = [inputSubjects, inputInternship, inputPAP];
    const simInputs  = [inputGoal, simSubjects, simInternship, simPAP];
    const allInputs  = [...calcInputs, ...simInputs];

    const barMap = {
        inputSubjects: barSubjects,
        inputInternship: barInternship,
        inputPAP: barPAP,
        simSubjects: simBarSubjects,
        simInternship: simBarInternship,
        simPAP: simBarPAP,
    };

    allInputs.forEach(el => {
        el.addEventListener("input", () => {
            updateBar(el);
            recalc();
        });
    });

    function updateBar(input) {
        const bar = barMap[input.id];
        if (!bar) return;
        const v = parseGrade(input.value);
        const pct = v !== null ? (v / 20) * 100 : 0;
        bar.style.setProperty("--fill", pct + "%");
    }

    // ── Main Recalculation ────────────────────
    function recalc() {
        if (mode === "calculate") calcFinal();
        else                      calcSim();
    }

    // ── Calculate Mode ────────────────────────
    function calcFinal() {
        const s = parseGrade(inputSubjects.value);
        const i = parseGrade(inputInternship.value);
        const p = parseGrade(inputPAP.value);

        const filled = [s, i, p].filter(v => v !== null);
        if (filled.length === 0) { hideResult(); return; }

        const rows = [];
        if (s !== null) rows.push(makeRow("Disciplinas", "subjects", fmt(s)));
        if (i !== null) rows.push(makeRow("Estágio",     "internship", fmt(i)));
        if (p !== null) rows.push(makeRow("PAP",         "pap", fmt(p)));

        if (filled.length === 3) {
            const final_ = (s + i + p) / 3;
            showResult(final_, rows, null);
        } else {
            const partial = filled.reduce((a, b) => a + b, 0) / filled.length;
            showResult(partial, rows, {
                type: "info",
                text: `Média parcial (${filled.length}/3). Usa "Simular" para calcular o que falta.`
            });
        }
    }

    // ── Simulate Mode ─────────────────────────
    function calcSim() {
        const goal = parseGrade(inputGoal.value);
        if (goal === null) { hideResult(); return; }

        const s = parseGrade(simSubjects.value);
        const i = parseGrade(simInternship.value);
        const p = parseGrade(simPAP.value);

        const known   = [];
        const missing = [];

        if (s !== null) known.push({ label: "Disciplinas", dot: "subjects", val: s });
        else            missing.push({ label: "Disciplinas", dot: "subjects" });

        if (i !== null) known.push({ label: "Estágio", dot: "internship", val: i });
        else            missing.push({ label: "Estágio", dot: "internship" });

        if (p !== null) known.push({ label: "PAP", dot: "pap", val: p });
        else            missing.push({ label: "PAP", dot: "pap" });

        // All filled
        if (missing.length === 0) {
            const final_ = (s + i + p) / 3;
            const diff = final_ - goal;
            const rows = [
                makeRow("Disciplinas", "subjects", fmt(s)),
                makeRow("Estágio", "internship", fmt(i)),
                makeRow("PAP", "pap", fmt(p)),
            ];
            let msg;
            if (diff >= 0) msg = { type: "success", text: `🎉 Objetivo superado por ${fmt(diff)} valores!` };
            else           msg = { type: "error",   text: `😬 Faltam ${fmt(Math.abs(diff))} valores para o objetivo.` };
            showResult(final_, rows, msg);
            return;
        }

        // None filled
        if (missing.length === 3) {
            const rows = [
                makeRow("Disciplinas", "subjects", fmt(goal), true),
                makeRow("Estágio", "internship", fmt(goal), true),
                makeRow("PAP", "pap", fmt(goal), true),
            ];
            showResult(goal, rows, { type: "info", text: "Precisas desta nota em todas as componentes." });
            return;
        }

        // 1 or 2 known
        const sumKnown  = known.reduce((a, b) => a + b.val, 0);
        const remaining = goal * 3 - sumKnown;
        const each      = remaining / missing.length;

        const rows = [];
        for (const k of known) {
            rows.push(makeRow(k.label, k.dot, fmt(k.val)));
        }

        const impossible = each > 20 || each < 0;
        for (const m of missing) {
            if (each > 20)      rows.push(makeRow(m.label, m.dot, "> 20", false, true));
            else if (each < 0)  rows.push(makeRow(m.label, m.dot, "✓ Garantido", false, false));
            else                rows.push(makeRow(m.label, m.dot, "≥ " + fmt(Math.ceil(each * 10) / 10), true));
        }

        let msg;
        if (each > 20)       msg = { type: "error",   text: "❌ Impossível — a nota necessária ultrapassa 20." };
        else if (each < 0)   msg = { type: "success", text: "🏆 Já ultrapassaste o objetivo!" };
        else if (each >= 18) msg = { type: "warning", text: "🔥 Vai ser difícil, mas não impossível. Força!" };
        else                 msg = { type: "success", text: "✅ Objetivo alcançável. Vais conseguir! 💪" };

        showResult(goal, rows, msg);
    }

    // ── Display ───────────────────────────────
    function showResult(grade, rows, message) {
        resultPanel.classList.remove("hidden");
        resultPanel.style.animation = "none";
        resultPanel.offsetHeight;
        resultPanel.style.animation = "";

        const [whole, dec] = fmt(grade).split(".");
        animateText(bigNum, whole);
        bigDec.textContent = dec;

        const pct = Math.min(grade / 20, 1) * 100;
        requestAnimationFrame(() => {
            resultBarFill.style.width = pct + "%";
        });

        resultBreak.innerHTML = rows.map(r => r.html).join("");

        if (message) {
            resultMsg.className = "result-msg " + message.type;
            resultMsg.textContent = message.text;
            resultMsg.classList.remove("hidden");
        } else {
            resultMsg.classList.add("hidden");
        }
    }

    function hideResult() {
        resultPanel.classList.add("hidden");
        resultBarFill.style.width = "0%";
    }

    function makeRow(label, dotClass, valueText, needed, impossible) {
        let cls = "breakdown-row";
        if (needed) cls += " needed";
        if (impossible) cls += " impossible";
        const prefix = needed ? "Mín: " : "";

        return {
            html: `
                <div class="${cls}">
                    <span class="breakdown-left">
                        <span class="breakdown-dot dot-${dotClass}"></span>
                        ${label}
                    </span>
                    <span class="breakdown-value">${prefix}${valueText}</span>
                </div>
            `
        };
    }

    // ── Animate number ────────────────────────
    function animateText(el, target) {
        const targetNum = parseInt(target, 10);
        const startNum  = parseInt(el.textContent, 10) || 0;
        const start     = performance.now();
        const dur       = 450;

        function tick(now) {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            const curr = Math.round(startNum + (targetNum - startNum) * ease);
            el.textContent = curr;
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    // ── Helpers ───────────────────────────────
    function parseGrade(val) {
        if (val === "" || val == null) return null;
        const n = parseFloat(val);
        if (isNaN(n)) return null;
        return Math.max(0, Math.min(20, n));
    }

    function fmt(n) {
        return n.toFixed(1);
    }
})();
