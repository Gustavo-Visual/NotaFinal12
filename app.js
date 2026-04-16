/* ============================================
   Grade Calculator – 12º Ano
   Dual Theme Edition + Custom Mode
   ============================================ */

(() => {
    "use strict";

    // ── DOM ────────────────────────────────────
    const html          = document.documentElement;
    const themeToggle   = document.getElementById("themeToggle");
    const themeIcon     = document.getElementById("themeIcon");
    const appearanceToggle = document.getElementById("appearanceToggle");
    const appearanceIcon   = document.getElementById("appearanceIcon");
    const tabCalc       = document.getElementById("tabCalc");
    const tabSim        = document.getElementById("tabSim");
    const tabCustom     = document.getElementById("tabCustom");
    const tabIndicator  = document.getElementById("tabIndicator");
    const calculateMode = document.getElementById("calculateMode");
    const simulateMode  = document.getElementById("simulateMode");
    const customMode    = document.getElementById("customMode");
    const resultPanel   = document.getElementById("resultPanel");
    const resultBreak   = document.getElementById("resultBreakdown");
    const resultMsg     = document.getElementById("resultMsg");
    const bigNum        = document.getElementById("bigNum");
    const bigDec        = document.getElementById("bigDec");
    const resultBarFill = document.getElementById("resultBarFill");
    const formulaCode   = document.getElementById("formulaCode");

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

    // Simulate sliders
    const sliderSimSubjects   = document.getElementById("sliderSimSubjects");
    const sliderSimInternship = document.getElementById("sliderSimInternship");
    const sliderSimPAP        = document.getElementById("sliderSimPAP");

    // Custom mode DOM
    const presetSelect       = document.getElementById("presetSelect");
    const weightBarFill      = document.getElementById("weightBarFill");
    const weightLabel        = document.getElementById("weightLabel");
    const customComponentsEl = document.getElementById("customComponents");
    const addComponentBtn    = document.getElementById("addComponentBtn");
    const autoDistributeBtn  = document.getElementById("autoDistributeBtn");
    const scaleMaxInput      = document.getElementById("scaleMax");

    // Help modal
    const helpBtn     = document.getElementById("helpBtn");
    const helpOverlay = document.getElementById("helpOverlay");
    const helpClose   = document.getElementById("helpClose");

    // Share button
    const shareBtn     = document.getElementById("shareBtn");
    const shareBtnText = document.getElementById("shareBtnText");
    const feedbackLink = document.getElementById("feedbackLink");

    let mode = "calculate";
    let customScaleMax = 20;
    let lastGrade = null;
    let lastRows = [];
    let lastMessage = null;

    // ── Constants ─────────────────────────────
    const CUSTOM_COLORS = [
        "#e91e63", "#2196f3", "#ff9800", "#4caf50",
        "#9c27b0", "#00bcd4", "#ff5722", "#607d8b"
    ];

    const MAX_COMPONENTS = 8;
    const DEFAULT_FORMULA = "(📚 + 💼 + ⭐) ÷ 3 = Nota Final";
    const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfSgk1IoXX3Hua3zlkoja9H16VugGSyBd2CUvABYba8_sH6Bg/viewform?usp=publish-editor";

    const PRESETS = {
        epromat: {
            scale: 20,
            components: [
                { name: "Disciplinas", weight: 33.33, grade: "" },
                { name: "Estágio", weight: 33.33, grade: "" },
                { name: "PAP", weight: 33.34, grade: "" }
            ]
        },
        regular: {
            scale: 20,
            components: [
                { name: "Avaliação Contínua", weight: 70, grade: "" },
                { name: "Exame Final", weight: 30, grade: "" }
            ]
        },
        superior: {
            scale: 20,
            components: [
                { name: "Avaliação Contínua", weight: 60, grade: "" },
                { name: "Exame Final", weight: 40, grade: "" }
            ]
        }
    };

    // ── Custom mode state ─────────────────────
    let customComponents = [
        { name: "", weight: "", grade: "" }
    ];

    // ── Theme System ──────────────────────────
    const THEME_STYLES = ["epromat", "criativo"];
    const THEME_ACTIONS = {
        epromat: { next: "criativo", icon: "🎨", title: "Mudar para tema Criativo" },
        criativo: { next: "epromat", icon: "🏫", title: "Mudar para tema EPROMAT" }
    };
    const APPEARANCE_ACTIONS = {
        light: { next: "dark", icon: "🌙", title: "Mudar para modo Escuro" },
        dark: { next: "light", icon: "☀️", title: "Mudar para modo Claro" }
    };
    const THEME_COLOR_MAP = {
        "epromat-light": "#1b1b2f",
        "epromat-dark": "#121826",
        "criativo-light": "#faf7f2",
        "criativo-dark": "#1a1a1a"
    };
    const STORAGE_THEME_STYLE = "nota-final-theme-style";
    const STORAGE_APPEARANCE = "nota-final-appearance";
    const LEGACY_THEME_KEY = "nota-final-theme";

    let themeStyle = "epromat";
    let appearance = "light";
    loadThemePreferences();
    applyThemeState();

    themeToggle.addEventListener("click", () => {
        const currentIdx = THEME_STYLES.indexOf(themeStyle);
        themeStyle = THEME_STYLES[(currentIdx + 1) % THEME_STYLES.length];
        persistThemePreferences();
        applyThemeState();
    });

    appearanceToggle.addEventListener("click", () => {
        appearance = appearance === "dark" ? "light" : "dark";
        persistThemePreferences();
        applyThemeState();
    });

    function loadThemePreferences() {
        const storedStyle = localStorage.getItem(STORAGE_THEME_STYLE);
        const storedAppearance = localStorage.getItem(STORAGE_APPEARANCE);

        if (THEME_STYLES.includes(storedStyle)) {
            themeStyle = storedStyle;
        }
        if (storedAppearance === "light" || storedAppearance === "dark") {
            appearance = storedAppearance;
        }

        if (storedStyle || storedAppearance) return;

        const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
        if (legacyTheme === "criativo") {
            themeStyle = "criativo";
            appearance = "light";
        } else if (legacyTheme === "escuro") {
            themeStyle = "epromat";
            appearance = "dark";
        } else if (legacyTheme === "epromat") {
            themeStyle = "epromat";
            appearance = "light";
        }

        if (legacyTheme) {
            persistThemePreferences();
            localStorage.removeItem(LEGACY_THEME_KEY);
        }
    }

    function persistThemePreferences() {
        localStorage.setItem(STORAGE_THEME_STYLE, themeStyle);
        localStorage.setItem(STORAGE_APPEARANCE, appearance);
    }

    function applyThemeState() {
        html.setAttribute("data-theme", themeStyle);
        html.setAttribute("data-appearance", appearance);

        const themeAction = THEME_ACTIONS[themeStyle];
        themeIcon.textContent = themeAction.icon;
        themeToggle.title = themeAction.title;
        themeToggle.setAttribute("aria-label", themeAction.title);

        const appearanceAction = APPEARANCE_ACTIONS[appearance];
        appearanceIcon.textContent = appearanceAction.icon;
        appearanceToggle.title = appearanceAction.title;
        appearanceToggle.setAttribute("aria-label", appearanceAction.title);

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            const colorKey = `${themeStyle}-${appearance}`;
            metaTheme.content = THEME_COLOR_MAP[colorKey] || THEME_COLOR_MAP["epromat-light"];
        }
    }

    // ── Help Modal ────────────────────────────
    feedbackLink.href = FEEDBACK_URL;

    helpBtn.addEventListener("click", () => {
        helpOverlay.classList.add("visible");
    });

    helpClose.addEventListener("click", () => {
        helpOverlay.classList.remove("visible");
    });

    helpOverlay.addEventListener("click", (e) => {
        if (e.target === helpOverlay) {
            helpOverlay.classList.remove("visible");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && helpOverlay.classList.contains("visible")) {
            helpOverlay.classList.remove("visible");
        }
    });

    // ── Mode Switching ────────────────────────
    const allTabs = [tabCalc, tabSim, tabCustom];
    const allSections = { calculate: calculateMode, simulate: simulateMode, custom: customMode };
    const tabOffsets = { calculate: "0%", simulate: "100%", custom: "200%" };

    tabCalc.addEventListener("click",   () => setMode("calculate"));
    tabSim.addEventListener("click",    () => setMode("simulate"));
    tabCustom.addEventListener("click", () => setMode("custom"));

    function setMode(m) {
        mode = m;
        allTabs.forEach(t => {
            const isActive = t.dataset.mode === m;
            t.classList.toggle("active", isActive);
            t.setAttribute("aria-selected", isActive ? "true" : "false");
        });

        tabIndicator.style.setProperty("--tab-offset", tabOffsets[m]);
        tabIndicator.dataset.mode = m;

        Object.entries(allSections).forEach(([key, section]) => {
            section.classList.toggle("hidden", key !== m);
        });

        hideResult();
        updateFormula();
        recalc();
    }

    // ── Input Listeners ───────────────────────
    const calcInputs = [inputSubjects, inputInternship, inputPAP];
    const simInputs  = [inputGoal, simSubjects, simInternship, simPAP];
    const fixedInputs = [...calcInputs, ...simInputs];

    const barMap = {
        inputSubjects: barSubjects,
        inputInternship: barInternship,
        inputPAP: barPAP,
        simSubjects: simBarSubjects,
        simInternship: simBarInternship,
        simPAP: simBarPAP,
    };

    fixedInputs.forEach(el => {
        el.addEventListener("input", () => {
            updateBar(el);
            validateInput(el);
            recalc();
            saveInputs();
        });
    });

    function updateBar(input) {
        const bar = barMap[input.id];
        if (!bar) return;
        const v = parseGrade(input.value);
        const pct = v !== null ? (v / 20) * 100 : 0;
        bar.style.setProperty("--fill", pct + "%");
    }

    // ── Simulate Sliders ──────────────────────
    const sliderPairs = [
        { slider: sliderSimSubjects,   input: simSubjects },
        { slider: sliderSimInternship, input: simInternship },
        { slider: sliderSimPAP,        input: simPAP },
    ];

    sliderPairs.forEach(({ slider, input }) => {
        slider.addEventListener("input", () => {
            input.value = slider.value;
            updateBar(input);
            validateInput(input);
            recalc();
            saveInputs();
        });

        // Sync slider when number input changes
        input.addEventListener("input", () => {
            const v = parseFloat(input.value);
            if (!isNaN(v)) slider.value = Math.max(0, Math.min(20, v));
            else slider.value = 0;
        });
    });

    // ── Input Validation ──────────────────────
    function validateInput(el) {
        const card = el.closest(".bento-card") || el.closest(".custom-row");
        if (!card) return;
        const errorDiv = card.querySelector(".input-error");
        if (!errorDiv) return;

        const raw = el.value;
        if (raw === "" || raw == null) {
            errorDiv.classList.add("hidden");
            errorDiv.textContent = "";
            return;
        }

        const n = parseFloat(raw);
        if (isNaN(n) || n < 0 || n > 20) {
            errorDiv.textContent = "O valor deve estar entre 0 e 20";
            errorDiv.classList.remove("hidden");
        } else {
            errorDiv.classList.add("hidden");
            errorDiv.textContent = "";
        }
    }

    // ── Main Recalculation ────────────────────
    function recalc() {
        if (mode === "calculate")    calcFinal();
        else if (mode === "simulate") calcSim();
        else if (mode === "custom")  calcCustom();
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

        if (missing.length === 3) {
            const rows = [
                makeRow("Disciplinas", "subjects", fmt(goal), true),
                makeRow("Estágio", "internship", fmt(goal), true),
                makeRow("PAP", "pap", fmt(goal), true),
            ];
            showResult(goal, rows, { type: "info", text: "Precisas desta nota em todas as componentes." });
            return;
        }

        const sumKnown  = known.reduce((a, b) => a + b.val, 0);
        const remaining = goal * 3 - sumKnown;
        const each      = remaining / missing.length;

        const rows = [];
        for (const k of known) {
            rows.push(makeRow(k.label, k.dot, fmt(k.val)));
        }

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

    // ── Custom Mode ───────────────────────────

    // Scale input listener
    scaleMaxInput.addEventListener("input", () => {
        const v = parseInt(scaleMaxInput.value, 10);
        if (!isNaN(v) && v >= 1 && v <= 200) {
            customScaleMax = v;
        }
        renderCustomComponents();
        recalc();
        saveInputs();
    });

    function renderCustomComponents() {
        customComponentsEl.innerHTML = customComponents.map((comp, i) => {
            const color = CUSTOM_COLORS[i % CUSTOM_COLORS.length];
            const weightVal = comp.weight !== "" && comp.weight != null ? comp.weight : "";
            const gradeVal = comp.grade !== "" && comp.grade != null ? comp.grade : "";
            return `
                <div class="custom-row" data-index="${i}" style="--row-color: ${color}">
                    <div class="custom-row-header">
                        <span class="custom-color-dot" style="background: ${color}"></span>
                        <input type="text" class="custom-name" placeholder="Nome da componente..."
                               value="${escHtml(String(comp.name))}" aria-label="Nome da componente ${i + 1}"
                               data-field="name" data-index="${i}">
                        <button class="custom-remove" aria-label="Remover componente" data-index="${i}"
                            ${customComponents.length <= 1 ? "disabled" : ""}>&times;</button>
                    </div>
                    <div class="custom-row-inputs">
                        <div class="custom-weight-wrap">
                            <input type="number" class="custom-weight" min="0" max="100" step="any"
                                   placeholder="%" value="${weightVal}"
                                   aria-label="Peso em percentagem" data-field="weight" data-index="${i}">
                            <span class="custom-pct">%</span>
                        </div>
                        <div class="custom-grade-wrap">
                            <input type="number" class="custom-grade grade-input" min="0" max="${customScaleMax}" step="0.1"
                                   placeholder="—" value="${gradeVal}"
                                   aria-label="Nota (0 a ${customScaleMax})" data-field="grade" data-index="${i}">
                            <span class="custom-of">/${customScaleMax}</span>
                        </div>
                    </div>
                    <div class="input-error hidden"></div>
                </div>
            `;
        }).join("");

        addComponentBtn.disabled = customComponents.length >= MAX_COMPONENTS;
        updateWeightStatus();
        updateFormula();
    }

    // Event delegation for custom components
    customComponentsEl.addEventListener("input", (e) => {
        const el = e.target;
        const idx = parseInt(el.dataset.index, 10);
        const field = el.dataset.field;
        if (isNaN(idx) || !field) return;

        if (field === "weight") {
            customComponents[idx].weight = el.value;
            updateWeightStatus();
        } else if (field === "grade") {
            customComponents[idx].grade = el.value;
            validateCustomGrade(el);
        } else {
            customComponents[idx][field] = el.value;
        }

        updateFormula();
        recalc();
        saveInputs();
    });

    customComponentsEl.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".custom-remove");
        if (!removeBtn || removeBtn.disabled) return;
        const idx = parseInt(removeBtn.dataset.index, 10);
        if (customComponents.length <= 1) return;
        customComponents.splice(idx, 1);
        renderCustomComponents();
        recalc();
        saveInputs();
    });

    addComponentBtn.addEventListener("click", () => {
        if (customComponents.length >= MAX_COMPONENTS) return;
        customComponents.push({ name: "", weight: "", grade: "" });
        renderCustomComponents();
        saveInputs();
    });

    // Auto-distribute weights equally
    autoDistributeBtn.addEventListener("click", () => {
        const count = customComponents.length;
        if (count === 0) return;
        const base = Math.floor((10000 / count)) / 100;
        let remainder = 100;
        for (let i = 0; i < count; i++) {
            if (i < count - 1) {
                customComponents[i].weight = base;
                remainder -= base;
            } else {
                customComponents[i].weight = Math.round(remainder * 100) / 100;
            }
        }
        renderCustomComponents();
        recalc();
        saveInputs();
    });

    presetSelect.addEventListener("change", () => {
        const key = presetSelect.value;
        if (key && PRESETS[key]) {
            const preset = PRESETS[key];
            customComponents = preset.components.map(c => ({
                name: c.name,
                weight: c.weight,
                grade: ""
            }));
            if (preset.scale) {
                customScaleMax = preset.scale;
                scaleMaxInput.value = preset.scale;
            }
        }
        renderCustomComponents();
        recalc();
        saveInputs();
    });

    function validateCustomGrade(el) {
        const card = el.closest(".custom-row");
        if (!card) return;
        const errorDiv = card.querySelector(".input-error");
        if (!errorDiv) return;

        const raw = el.value;
        if (raw === "" || raw == null) {
            errorDiv.classList.add("hidden");
            errorDiv.textContent = "";
            return;
        }

        const n = parseFloat(raw);
        if (isNaN(n) || n < 0 || n > customScaleMax) {
            errorDiv.textContent = `O valor deve estar entre 0 e ${customScaleMax}`;
            errorDiv.classList.remove("hidden");
        } else {
            errorDiv.classList.add("hidden");
            errorDiv.textContent = "";
        }
    }

    function parseWeight(val) {
        if (val === "" || val == null) return null;
        const n = parseFloat(val);
        if (isNaN(n)) return null;
        return n;
    }

    function updateWeightStatus() {
        let total = 0;
        for (const comp of customComponents) {
            const w = parseWeight(comp.weight);
            if (w !== null) total += w;
        }

        const pct = Math.max(0, Math.min(total, 100));
        weightBarFill.style.width = pct + "%";

        const isValid = Math.abs(total - 100) < 0.1 && total >= 0;
        const isOver = total > 100.1;
        const hasNegative = customComponents.some(c => {
            const w = parseWeight(c.weight);
            return w !== null && w < 0;
        });

        weightBarFill.classList.toggle("valid", isValid && !hasNegative);
        weightBarFill.classList.toggle("over", isOver || hasNegative);
        weightLabel.classList.toggle("valid", isValid && !hasNegative);
        weightLabel.classList.toggle("over", isOver || hasNegative);

        const totalDisplay = Number.isInteger(total) ? total.toString() : total.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
        weightLabel.textContent = `${totalDisplay}% / 100%`;
    }

    function parseCustomGrade(val) {
        if (val === "" || val == null) return null;
        const n = parseFloat(val);
        if (isNaN(n)) return null;
        return Math.max(0, Math.min(customScaleMax, n));
    }

    function calcCustom() {
        let totalWeight = 0;
        let hasNegativeWeight = false;
        for (const comp of customComponents) {
            const w = parseWeight(comp.weight);
            if (w !== null) {
                if (w < 0) hasNegativeWeight = true;
                totalWeight += w;
            }
        }

        if (hasNegativeWeight || Math.abs(totalWeight - 100) >= 0.1) {
            hideResult();
            return;
        }

        const rows = [];
        let weightedSum = 0;
        let allFilled = true;

        for (let i = 0; i < customComponents.length; i++) {
            const comp = customComponents[i];
            const g = parseCustomGrade(comp.grade);
            const w = parseWeight(comp.weight);
            const color = CUSTOM_COLORS[i % CUSTOM_COLORS.length];
            const label = comp.name || `Componente ${i + 1}`;

            if (g !== null && w !== null && w > 0) {
                const normalizedGrade = (g / customScaleMax) * 20;
                weightedSum += normalizedGrade * (w / 100);
                const gradeDisplay = customScaleMax === 20 ? fmt(g) : `${fmt(g)}/${customScaleMax}`;
                rows.push(makeRow(label, null, gradeDisplay, false, false, color));
            } else if (w !== null && w > 0) {
                allFilled = false;
            }
        }

        if (rows.length === 0) { hideResult(); return; }

        if (allFilled) {
            if (customScaleMax !== 20) {
                showResult(weightedSum, rows, {
                    type: "info",
                    text: `Resultado normalizado para escala 0–20.`
                });
            } else {
                showResult(weightedSum, rows, null);
            }
        } else {
            const filledCount = rows.length;
            showResult(weightedSum, rows, {
                type: "info",
                text: `Parcial (${filledCount}/${customComponents.length}). Preenche todas as notas para ver o resultado final.`
            });
        }
    }

    // ── Display ───────────────────────────────
    function showResult(grade, rows, message) {
        lastGrade = grade;
        lastRows = rows;
        lastMessage = message;

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
        lastGrade = null;
    }

    function makeRow(label, dotClass, valueText, needed, impossible, inlineColor) {
        let cls = "breakdown-row";
        if (needed) cls += " needed";
        if (impossible) cls += " impossible";
        const prefix = needed ? "Mín: " : "";

        let dotHtml;
        if (inlineColor) {
            dotHtml = `<span class="breakdown-dot" style="background: ${inlineColor}"></span>`;
        } else {
            dotHtml = `<span class="breakdown-dot dot-${dotClass}"></span>`;
        }

        return {
            label: label,
            value: prefix + valueText,
            html: `
                <div class="${cls}">
                    <span class="breakdown-left">
                        ${dotHtml}
                        ${escHtml(label)}
                    </span>
                    <span class="breakdown-value">${prefix}${valueText}</span>
                </div>
            `
        };
    }

    // ── Share / Copy ──────────────────────────
    shareBtn.addEventListener("click", () => {
        if (lastGrade === null) return;

        const modeNames = { calculate: "Calcular", simulate: "Simular", custom: "Personalizado" };
        let text = `📊 Nota Final — ${modeNames[mode] || mode}\n`;
        text += `━━━━━━━━━━━━━━━━━━━\n`;
        text += `Resultado: ${fmt(lastGrade)} / 20\n\n`;

        for (const row of lastRows) {
            text += `• ${row.label}: ${row.value}\n`;
        }

        if (lastMessage) {
            text += `\n${lastMessage.text}\n`;
        }

        text += `\n— Nota Final 12º Ano`;

        navigator.clipboard.writeText(text).then(() => {
            shareBtn.classList.add("copied");
            shareBtnText.textContent = "Copiado!";
            setTimeout(() => {
                shareBtn.classList.remove("copied");
                shareBtnText.textContent = "Copiar resultado";
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            shareBtnText.textContent = "Erro ao copiar";
            setTimeout(() => {
                shareBtnText.textContent = "Copiar resultado";
            }, 2000);
        });
    });

    // ── Formula Footer ────────────────────────
    function updateFormula() {
        if (mode !== "custom") {
            formulaCode.textContent = DEFAULT_FORMULA;
            return;
        }
        const parts = customComponents
            .map(c => {
                const name = c.name || "?";
                const w = c.weight !== "" && c.weight != null ? c.weight + "%" : "?%";
                return `${name}×${w}`;
            });
        const scaleNote = customScaleMax !== 20 ? ` (→0-20)` : "";
        formulaCode.textContent = parts.join(" + ") + " = Nota Final" + scaleNote;
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

    // ── localStorage Persistence ──────────────
    function saveInputs() {
        localStorage.setItem("nota-final-calc", JSON.stringify({
            subjects: inputSubjects.value,
            internship: inputInternship.value,
            pap: inputPAP.value
        }));

        localStorage.setItem("nota-final-sim", JSON.stringify({
            goal: inputGoal.value,
            subjects: simSubjects.value,
            internship: simInternship.value,
            pap: simPAP.value
        }));

        localStorage.setItem("nota-final-custom", JSON.stringify({
            preset: presetSelect.value,
            components: customComponents,
            scaleMax: customScaleMax
        }));
    }

    function loadAllInputs() {
        try {
            const calc = JSON.parse(localStorage.getItem("nota-final-calc"));
            if (calc) {
                inputSubjects.value   = calc.subjects || "";
                inputInternship.value = calc.internship || "";
                inputPAP.value        = calc.pap || "";
                calcInputs.forEach(updateBar);
            }
        } catch (e) { /* ignore */ }

        try {
            const sim = JSON.parse(localStorage.getItem("nota-final-sim"));
            if (sim) {
                inputGoal.value     = sim.goal || "";
                simSubjects.value   = sim.subjects || "";
                simInternship.value = sim.internship || "";
                simPAP.value        = sim.pap || "";
                [simSubjects, simInternship, simPAP].forEach(updateBar);
                // Sync sliders
                syncSliders();
            }
        } catch (e) { /* ignore */ }

        try {
            const custom = JSON.parse(localStorage.getItem("nota-final-custom"));
            if (custom && custom.components && custom.components.length > 0) {
                customComponents = custom.components;
                presetSelect.value = custom.preset || "";
                if (custom.scaleMax && custom.scaleMax >= 1 && custom.scaleMax <= 200) {
                    customScaleMax = custom.scaleMax;
                    scaleMaxInput.value = custom.scaleMax;
                }
            }
        } catch (e) { /* ignore */ }
    }

    function syncSliders() {
        sliderPairs.forEach(({ slider, input }) => {
            const v = parseFloat(input.value);
            slider.value = (!isNaN(v) && v >= 0 && v <= 20) ? v : 0;
        });
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

    function escHtml(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }

    // ── Init ──────────────────────────────────
    loadAllInputs();
    renderCustomComponents();
    recalc();

    // ── Service Worker Registration ───────────
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
})();
