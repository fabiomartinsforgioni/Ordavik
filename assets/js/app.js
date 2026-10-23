// Gerado por npm run build. Edite os módulos em src/js.
(() => {
  // src/js/data.js
  var STORAGE_KEYS = Object.freeze({
    tasks: "taskflow-tasks",
    // Chave das sprints antigas: NÃO alterar.
    meetings: "taskflow-meetings",
    celebrations: "taskflow-celebrations",
    clients: "ordavik-clients",
    demands: "ordavik-demands",
    theme: "taskflow-theme"
  });
  var loadIssues = [];
  var blockedKeys = /* @__PURE__ */ new Set();
  function clearLoadIssues() {
    loadIssues.splice(0);
    blockedKeys.clear();
  }
  var PRIORITIES = Object.freeze({ low: "Baixa", medium: "M\xE9dia", high: "Alta" });
  var CATEGORIES = Object.freeze({
    work: "Trabalho",
    personal: "Pessoal",
    studies: "Estudos",
    other: "Outros"
  });
  var KINDS = Object.freeze({ birthday: "Anivers\xE1rio", special: "Data especial" });
  var STATUSES = Object.freeze({
    pending: "Pendente",
    progress: "Em andamento",
    waiting: "Aguardando retorno",
    completed: "Conclu\xEDda"
  });
  var RECURRENCES = Object.freeze({
    none: "N\xE3o repetir",
    daily: "Diariamente",
    weekly: "Semanalmente",
    monthly: "Mensalmente"
  });
  function safeText(value, max = 140) {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  }
  function allowed(value, choices, fallback) {
    return Object.hasOwn(choices, value) ? value : fallback;
  }
  function validDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split("-").map(Number);
    if (year < 1900 || year > 2100 || month < 1 || month > 12) return false;
    const date = new Date(year, month - 1, day, 12);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
  function validTime(value) {
    return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }
  function localKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function todayKey() {
    return localKey(/* @__PURE__ */ new Date());
  }
  function parseLocal(key) {
    if (!validDate(key)) return null;
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }
  function plusDays(key, amount) {
    const date = parseLocal(key);
    if (!date) return "";
    date.setDate(date.getDate() + amount);
    return localKey(date);
  }
  var brDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  function formatDate(key) {
    return parseLocal(key) ? brDate.format(parseLocal(key)) : "Sem data";
  }
  function formatDay(key) {
    const date = parseLocal(key);
    return date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(date) : "Data inv\xE1lida";
  }
  function uniqueId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
      return crypto.randomUUID();
    return `tf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  function parseTags(raw) {
    const parts = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
    return [...new Set(parts.map((value) => safeText(value, 25)).filter(Boolean))].slice(0, 8);
  }
  function normalizeTask(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = safeText(raw.id, 100);
    const description = safeText(raw.description || raw.title, 140);
    if (!id || !description || typeof raw.completed !== "boolean") return null;
    const startDate = validDate(raw.startDate) ? raw.startDate : "";
    const dueDate = validDate(raw.dueDate) ? raw.dueDate : "";
    const status = raw.completed ? "completed" : allowed(raw.status, STATUSES, "pending");
    const minutes = (value) => Number.isFinite(Number(value)) ? Math.min(1e5, Math.max(0, Math.round(Number(value)))) : 0;
    return {
      ...raw,
      id,
      description,
      status,
      completed: status === "completed",
      nextAction: safeText(raw.nextAction, 300),
      clientId: safeText(raw.clientId, 100),
      demandId: safeText(raw.demandId, 100),
      workType: safeText(raw.workType, 40) || "task",
      waitingFor: safeText(raw.waitingFor, 200),
      followUpDate: validDate(raw.followUpDate) ? raw.followUpDate : "",
      recurrence: allowed(raw.recurrence, RECURRENCES, "none"),
      estimatedMinutes: minutes(raw.estimatedMinutes),
      actualMinutes: minutes(raw.actualMinutes),
      subtasks: (Array.isArray(raw.subtasks) ? raw.subtasks : []).filter((s) => s && typeof s.text === "string" && s.text.trim()).slice(0, 50).map((s) => ({
        id: safeText(s.id, 100) || uniqueId(),
        text: safeText(s.text, 180),
        completed: s.completed === true
      })),
      history: (Array.isArray(raw.history) ? raw.history : []).filter(
        (h) => h && typeof h.at === "string" && !Number.isNaN(Date.parse(h.at)) && typeof h.text === "string"
      ).slice(-100).map((h) => ({ at: h.at, text: safeText(h.text, 500) })),
      details: safeText(raw.details, 1e3),
      category: allowed(raw.category, CATEGORIES, "other"),
      project: safeText(raw.project, 80),
      priority: allowed(raw.priority, PRIORITIES, "medium"),
      tags: parseTags(raw.tags),
      startDate,
      dueDate,
      dueTime: dueDate && validTime(raw.dueTime) ? raw.dueTime : ""
    };
  }
  function normalizeMeeting(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = safeText(raw.id, 100);
    const title = safeText(raw.title, 140);
    if (!id || !title || !validDate(raw.date) || !validTime(raw.startTime) || !validTime(raw.endTime) || raw.endTime <= raw.startTime)
      return null;
    return {
      id,
      title,
      date: raw.date,
      clientId: safeText(raw.clientId, 100),
      startTime: raw.startTime,
      endTime: raw.endTime,
      category: allowed(raw.category, CATEGORIES, "other"),
      project: safeText(raw.project, 80),
      details: safeText(raw.details, 1e3),
      location: safeText(raw.location, 300)
    };
  }
  function normalizeCelebration(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = safeText(raw.id, 100), name = safeText(raw.name, 140);
    if (!id || !name || !validDate(raw.date)) return null;
    return {
      id,
      name,
      date: raw.date,
      kind: allowed(raw.kind, KINDS, "birthday"),
      notes: safeText(raw.notes, 250)
    };
  }
  function loadRecords(storageKey, normalizer) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return [];
      const records = JSON.parse(raw);
      if (!Array.isArray(records)) throw new Error("A cole\xE7\xE3o n\xE3o \xE9 uma lista.");
      const seen = /* @__PURE__ */ new Set();
      const normalized = records.map(normalizer).filter((item) => {
        if (!item || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      if (normalized.length !== records.length) {
        blockedKeys.add(storageKey);
        loadIssues.push(storageKey);
      }
      return normalized;
    } catch (error) {
      console.warn(`Ordavik: dados indispon\xEDveis em ${storageKey}.`, error);
      blockedKeys.add(storageKey);
      loadIssues.push(storageKey);
      return [];
    }
  }
  function saveRecords(storageKey, records) {
    if (blockedKeys.has(storageKey)) return false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
      return true;
    } catch (error) {
      console.warn(`Ordavik: falha ao salvar ${storageKey}.`, error);
      return false;
    }
  }
  function isOverdue(task, now = /* @__PURE__ */ new Date()) {
    if (task.completed || !validDate(task.dueDate)) return false;
    const deadline = `${task.dueDate}T${validTime(task.dueTime) ? task.dueTime : "23:59"}`;
    const current = `${localKey(now)}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return deadline < current;
  }
  function yearlyDate(celebration, year) {
    const monthDay = celebration.date.slice(5);
    const leapFallback = monthDay === "02-29" && !validDate(`${year}-02-29`);
    return `${year}-${leapFallback ? "02-28" : monthDay}`;
  }
  function easter(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k + 7 * 700) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const x = h + l - 7 * m + 114;
    return `${year}-${String(Math.floor(x / 31)).padStart(2, "0")}-${String(x % 31 + 1).padStart(2, "0")}`;
  }
  function fallbackHolidays(year) {
    const fixed = [
      ["01-01", "Confraterniza\xE7\xE3o Universal"],
      ["04-21", "Tiradentes"],
      ["05-01", "Dia do Trabalho"],
      ["09-07", "Independ\xEAncia do Brasil"],
      ["10-12", "Nossa Senhora Aparecida"],
      ["11-02", "Finados"],
      ["11-15", "Proclama\xE7\xE3o da Rep\xFAblica"],
      ["12-25", "Natal"]
    ];
    if (year >= 2024) fixed.push(["11-20", "Dia Nacional de Zumbi e da Consci\xEAncia Negra"]);
    const holidays = fixed.map(([day, name]) => ({ date: `${year}-${day}`, name, type: "holiday" }));
    holidays.push({ date: plusDays(easter(year), -2), name: "Paix\xE3o de Cristo", type: "holiday" });
    return holidays.sort((a, b) => a.date.localeCompare(b.date));
  }
  var holidayCache = /* @__PURE__ */ new Map();
  function getNationalHolidays(year) {
    if (holidayCache.has(year)) return holidayCache.get(year);
    const fallback = fallbackHolidays(year);
    const promise = (async () => {
      if (typeof fetch !== "function") return { holidays: fallback, source: "local" };
      try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
          signal: AbortSignal.timeout(5e3)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const records = await response.json();
        if (!Array.isArray(records)) throw new Error("Resposta inesperada");
        const namesByDate = new Map(
          records.filter((r) => validDate(r.date) && typeof r.name === "string").map((r) => [r.date, safeText(r.name, 100)])
        );
        return {
          holidays: fallback.map((h) => ({ ...h, name: namesByDate.get(h.date) || h.name })),
          source: "BrasilAPI"
        };
      } catch (error) {
        console.info("Ordavik: usando feriados nacionais locais.", error.message);
        return { holidays: fallback, source: "local" };
      }
    })();
    holidayCache.set(year, promise);
    return promise;
  }

  // src/js/ui.js
  var $ = (selector) => document.querySelector(selector);
  var $$ = (selector) => [...document.querySelectorAll(selector)];
  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  }
  function actionButton(label, icon, callback, variant = "secondary", key = label) {
    const button = element(
      "button",
      `icon-button action-${variant}`,
      { "pencil-square": "\u270E", trash3: "\xD7" }[icon] || icon
    );
    button.type = "button";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.dataset.uiKey = `action:${key}`;
    button.addEventListener("click", callback);
    return button;
  }
  function renderEmpty(text) {
    return element("p", "muted-empty", text);
  }
  function replacePreservingState(container, nodes) {
    const openKeys = new Set(
      [...container.querySelectorAll("details[open][data-ui-key]")].map((node) => node.dataset.uiKey)
    );
    const focused = document.activeElement;
    const focusKey = container.contains(focused) ? focused.dataset.uiKey : null;
    container.replaceChildren(...nodes);
    for (const node of container.querySelectorAll("[data-ui-key]")) {
      if (node.tagName === "DETAILS" && openKeys.has(node.dataset.uiKey)) node.open = true;
      if (focusKey && node.dataset.uiKey === focusKey) node.focus({ preventScroll: true });
    }
  }
  var timer;
  function notify(text, kind = "success", undo) {
    const box = $("#app-message");
    clearTimeout(timer);
    box.replaceChildren(element("span", "", text));
    box.dataset.kind = kind;
    box.hidden = false;
    if (undo) {
      const button = element("button", "btn btn-sm btn-outline-secondary", "Desfazer");
      button.type = "button";
      button.addEventListener(
        "click",
        () => {
          undo();
          box.hidden = true;
        },
        { once: true }
      );
      box.append(button);
    }
    const close = element("button", "icon-button", "\xD7");
    close.type = "button";
    close.setAttribute("aria-label", "Fechar mensagem");
    close.addEventListener("click", () => {
      box.hidden = true;
    });
    box.append(close);
    if (!undo && kind !== "error")
      timer = setTimeout(() => {
        box.hidden = true;
      }, 6e3);
  }

  // src/js/config.js
  var BRAND = Object.freeze({ name: "Ordavik", tagline: "Clareza para o pr\xF3ximo passo." });

  // src/js/task-rules.js
  function setTaskStatus(task, status, at = (/* @__PURE__ */ new Date()).toISOString()) {
    if (!Object.hasOwn(STATUSES, status) || task.status === status) return false;
    const previous = STATUSES[task.status] || STATUSES.pending;
    task.status = status;
    task.completed = status === "completed";
    task.completedAt = task.completed ? at : null;
    task.history = [
      ...task.history || [],
      { at, text: `Andamento: ${previous} \u2192 ${STATUSES[status]}.` }
    ].slice(-100);
    return true;
  }
  function mergeSubtasks(raw, original = []) {
    const available = [...original];
    return raw.split("\n").map((text) => text.trim()).filter(Boolean).slice(0, 50).map((text) => {
      const index = available.findIndex((item) => item.text === text);
      if (index >= 0) return { ...available.splice(index, 1)[0] };
      return { id: uniqueId(), text, completed: false };
    });
  }
  function nextOccurrence(date, recurrence) {
    if (!validDate(date)) return "";
    if (recurrence === "daily") return plusDays(date, 1);
    if (recurrence === "weekly") return plusDays(date, 7);
    if (recurrence !== "monthly") return "";
    const parsed = parseLocal(date);
    const day = parsed.getDate();
    parsed.setDate(1);
    parsed.setMonth(parsed.getMonth() + 1);
    const last = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate();
    parsed.setDate(Math.min(day, last));
    return localKey(parsed);
  }
  function makeNextTask(task) {
    const dueDate = nextOccurrence(task.dueDate, task.recurrence);
    if (!dueDate) return null;
    const offset = task.startDate && validDate(task.startDate) ? Math.round((parseLocal(dueDate) - parseLocal(task.dueDate)) / 864e5) : 0;
    return normalizeTask({
      ...task,
      id: uniqueId(),
      completed: false,
      status: "pending",
      dueDate,
      startDate: task.startDate ? plusDays(task.startDate, offset) : "",
      actualMinutes: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      completedAt: null,
      recurrenceSourceId: task.id,
      recurrenceNextId: null,
      history: [{ at: (/* @__PURE__ */ new Date()).toISOString(), text: "Ocorr\xEAncia criada automaticamente." }],
      subtasks: (task.subtasks || []).map((s) => ({ ...s, id: uniqueId(), completed: false }))
    });
  }
  function selectTasks(tasks, filters = {}) {
    const {
      query = "",
      category = "all",
      priority = "all",
      status = "all",
      period = "all",
      project = "",
      sort = "deadline",
      clients = [],
      demands = []
    } = filters;
    const lower = (value) => String(value || "").toLocaleLowerCase("pt-BR");
    const today = todayKey();
    const rank = { high: 0, medium: 1, low: 2 };
    return tasks.filter((task) => {
      const clientName = clients.find((c) => c.id === task.clientId)?.name || "";
      const demandTitle = demands.find((d) => d.id === task.demandId)?.title || "";
      if (status === "pending" && task.completed || status === "completed" && !task.completed)
        return false;
      if (["progress", "waiting"].includes(status) && task.status !== status) return false;
      if (category !== "all" && task.category !== category || priority !== "all" && task.priority !== priority)
        return false;
      if (period === "none" && task.dueDate || period === "overdue" && !isOverdue(task) || period === "today" && task.dueDate !== today)
        return false;
      if (period === "week" && (!task.dueDate || task.dueDate < today || task.dueDate > plusDays(today, 6)))
        return false;
      if (!lower([task.project, clientName].join(" ")).includes(lower(project))) return false;
      return lower(
        [
          task.description,
          task.details,
          task.project,
          task.nextAction,
          clientName,
          demandTitle,
          task.waitingFor,
          CATEGORIES[task.category],
          ...task.tags || []
        ].join(" ")
      ).includes(lower(query).trim());
    }).sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (sort === "priority") return (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1);
      if (sort === "title") return a.description.localeCompare(b.description, "pt-BR");
      if (sort === "newest") return (b.createdAt || "").localeCompare(a.createdAt || "");
      return `${a.dueDate || "9999-12-31"}T${a.dueTime || "23:59"}`.localeCompare(
        `${b.dueDate || "9999-12-31"}T${b.dueTime || "23:59"}`
      );
    });
  }
  var TEMPLATES = {
    simple: {
      label: "Tarefa simples",
      description: "",
      placeholder: "O que voc\xEA precisa fazer?",
      category: "other",
      subtasks: []
    },
    reminder: {
      label: "Lembrete",
      description: "",
      placeholder: "Ex.: ligar para algu\xE9m ou renovar um documento",
      category: "personal",
      subtasks: []
    },
    personal: {
      label: "Atividade pessoal",
      description: "",
      placeholder: "Ex.: organizar os documentos da casa",
      category: "personal",
      subtasks: []
    },
    shopping: {
      label: "Compras e pend\xEAncias",
      description: "Organizar compras",
      category: "personal",
      subtasks: ["Listar o que falta", "Conferir valores", "Realizar a compra"]
    },
    administrative: {
      label: "Rotina administrativa",
      description: "Resolver pend\xEAncia administrativa",
      category: "work",
      subtasks: ["Reunir informa\xE7\xF5es", "Executar a atividade", "Conferir o resultado"]
    },
    followup: {
      label: "Acompanhar retorno",
      description: "Acompanhar solicita\xE7\xE3o",
      category: "work",
      subtasks: ["Consultar o andamento", "Registrar o retorno", "Definir o pr\xF3ximo passo"]
    },
    bugfix: {
      label: "Corre\xE7\xE3o de problema",
      description: "Corrigir problema",
      category: "work",
      subtasks: ["Reproduzir o erro", "Corrigir a causa", "Testar o resultado"]
    },
    reading: {
      label: "Leitura ou curso",
      description: "Avan\xE7ar na leitura ou no curso",
      category: "studies",
      subtasks: ["Selecionar o conte\xFAdo", "Estudar", "Anotar os principais pontos"]
    },
    investigation: {
      label: "Investiga\xE7\xE3o de demanda",
      description: "Investigar demanda",
      category: "work",
      subtasks: [
        "Reproduzir o problema",
        "Reunir evid\xEAncias",
        "Identificar a causa",
        "Validar a solu\xE7\xE3o",
        "Documentar o resultado"
      ]
    },
    study: {
      label: "Sess\xE3o de estudos",
      description: "Sess\xE3o de estudos",
      category: "studies",
      subtasks: ["Revisar o conte\xFAdo", "Praticar com um exerc\xEDcio", "Registrar d\xFAvidas"]
    },
    delivery: {
      label: "Preparar entrega",
      description: "Preparar entrega",
      category: "work",
      subtasks: [
        "Revisar os requisitos",
        "Implementar",
        "Testar",
        "Preparar documenta\xE7\xE3o",
        "Validar a entrega"
      ]
    }
  };

  // src/js/work-rules.js
  var WORK_TYPES = Object.freeze({
    task: "Atividade",
    support: "Suporte",
    investigation: "Investiga\xE7\xE3o",
    fix: "Corre\xE7\xE3o",
    improvement: "Melhoria",
    meeting: "Reuni\xE3o",
    documentation: "Documenta\xE7\xE3o",
    routine: "Rotina"
  });
  function normalizeClient(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = safeText(raw.id, 100), name = safeText(raw.name, 80);
    if (!id || !name) return null;
    return {
      ...raw,
      id,
      name,
      notes: safeText(raw.notes, 5e3),
      favorite: raw.favorite === true,
      archived: raw.archived === true
    };
  }
  function normalizeDemand(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = safeText(raw.id, 100), clientId = safeText(raw.clientId, 100), title = safeText(raw.title, 140);
    if (!id || !clientId || !title) return null;
    const result = {
      ...raw,
      id,
      clientId,
      title,
      status: allowed(raw.status, STATUSES, "pending"),
      priority: allowed(raw.priority, PRIORITIES, "medium"),
      archived: raw.archived === true,
      dueDate: validDate(raw.dueDate) ? raw.dueDate : "",
      followUpDate: validDate(raw.followUpDate) ? raw.followUpDate : ""
    };
    for (const name of ["ticket", "waitingFor", "environment"])
      result[name] = safeText(raw[name], 200);
    for (const name of [
      "objective",
      "currentBehavior",
      "expectedResult",
      "evidence",
      "nextAction",
      "acceptance",
      "notes"
    ])
      result[name] = safeText(raw[name], 2e3);
    return result;
  }
  function validateWorkLinks({ clients = [], demands = [], tasks = [], meetings = [] }) {
    const clientIds = new Set(clients.map((c) => c.id)), byDemand = new Map(demands.map((d) => [d.id, d]));
    for (const demand of demands)
      if (!clientIds.has(demand.clientId))
        throw new Error("Demanda vinculada a cliente inexistente.");
    for (const item of [...tasks, ...meetings]) {
      if (item.clientId && !clientIds.has(item.clientId))
        throw new Error("Atividade vinculada a cliente inexistente.");
      if (item.demandId && (!byDemand.has(item.demandId) || byDemand.get(item.demandId).clientId !== item.clientId))
        throw new Error("A demanda e o cliente da tarefa n\xE3o correspondem.");
    }
  }
  function workSummary(tasks, day) {
    const now = day ? parseLocal(day) : /* @__PURE__ */ new Date();
    const today = day || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return {
      total: tasks.length,
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      waiting: tasks.filter((t) => !t.completed && t.status === "waiting").length,
      overdue: tasks.filter((t) => isOverdue(t, now)).length,
      followUps: tasks.filter((t) => !t.completed && t.followUpDate && t.followUpDate <= today).length
    };
  }

  // src/js/tasks.js
  function initTasks(ctx2) {
    const { tasks } = ctx2.state;
    const form = $("#task-form");
    const fields = Object.fromEntries(
      Object.entries({
        description: "input",
        details: "details",
        category: "category",
        priority: "priority",
        project: "project",
        clientId: "client",
        demandId: "demand",
        workType: "work-type",
        waitingFor: "waiting-for",
        followUpDate: "follow-up",
        tags: "tags",
        startDate: "start-date",
        dueDate: "due-date",
        dueTime: "due-time",
        status: "status",
        nextAction: "next-action",
        recurrence: "recurrence",
        estimatedMinutes: "estimated",
        actualMinutes: "actual",
        subtasks: "subtasks"
      }).map(([key, id]) => [key, $(`#task-${id}`)])
    );
    let editingId = null, activeFilter = "all";
    const defaultPlaceholder = fields.description.placeholder;
    for (const [value, label] of Object.entries(WORK_TYPES)) {
      const option = element("option", "", label);
      option.value = value;
      fields.workType.append(option);
    }
    function syncWorkOptions(clientId = fields.clientId.value, demandId = fields.demandId.value) {
      const update = (select, records, placeholder, value) => {
        const first = element("option", "", placeholder);
        first.value = "";
        select.replaceChildren(
          first,
          ...records.map(([id, label]) => {
            const option = element("option", "", label);
            option.value = id;
            return option;
          })
        );
        select.value = [...select.options].some((o) => o.value === value) ? value : "";
      };
      update(
        fields.clientId,
        ctx2.state.clients.filter((c) => !c.archived || c.id === clientId).map((c) => [c.id, c.name + (c.archived ? " (arquivado)" : "")]),
        "Sem cliente",
        clientId
      );
      update(
        fields.demandId,
        ctx2.state.demands.filter((d) => d.clientId === clientId && (!d.archived || d.id === demandId)).map((d) => [d.id, d.title + (d.archived ? " (arquivada)" : "")]),
        "Tarefa avulsa",
        demandId
      );
    }
    fields.clientId.addEventListener("change", () => {
      fields.demandId.value = "";
      if (fields.clientId.value) fields.category.value = "work";
      syncWorkOptions();
    });
    function createFor(clientId = "", demandId = "") {
      reset();
      syncWorkOptions(clientId, demandId);
      fields.category.value = "work";
      $("#task-advanced").open = true;
      ctx2.navigate("tasks");
      fields.description.focus();
    }
    for (const [key, template] of Object.entries(TEMPLATES)) {
      const option = element("option", "", template.label);
      option.value = key;
      $("#task-template").append(option);
    }
    const log = (task, text) => {
      task.history.push({ at: (/* @__PURE__ */ new Date()).toISOString(), text });
      task.history = task.history.slice(-100);
    };
    const clearValidity = () => Object.values(fields).forEach((field) => field.setCustomValidity(""));
    form.addEventListener("input", clearValidity);
    form.addEventListener(
      "invalid",
      () => {
        $("#task-advanced").open = true;
      },
      true
    );
    function reset() {
      form.reset();
      clearValidity();
      editingId = null;
      $("#task-form-heading").textContent = "Nova tarefa";
      $("#task-submit").textContent = "Adicionar tarefa";
      $("#task-cancel").hidden = true;
      $("#task-advanced").open = false;
      $("#task-template").value = "";
      fields.description.placeholder = defaultPlaceholder;
    }
    function edit(id) {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      reset();
      editingId = id;
      syncWorkOptions(task.clientId, task.demandId);
      for (const [key, field] of Object.entries(fields)) {
        field.value = key === "tags" ? task.tags.join(", ") : key === "subtasks" ? task.subtasks.map((s) => s.text).join("\n") : task[key] ?? "";
      }
      $("#task-form-heading").textContent = "Editar tarefa";
      $("#task-submit").textContent = "Salvar altera\xE7\xF5es";
      $("#task-cancel").hidden = false;
      $("#task-advanced").open = true;
      ctx2.navigate("tasks");
      fields.description.focus();
      form.scrollIntoView({ block: "start" });
    }
    function complete(task, checked, status = checked ? "completed" : "pending") {
      if (!setTaskStatus(task, status)) return;
      if (editingId === task.id) fields.status.value = status;
      if (checked && task.recurrence !== "none" && !tasks.some((t) => t.recurrenceSourceId === task.id) && !task.recurrenceNextId) {
        const next = makeNextTask(task);
        if (next) {
          tasks.push(next);
          task.recurrenceNextId = next.id;
        }
      }
      ctx2.persist(STORAGE_KEYS.tasks, tasks);
      ctx2.refresh();
    }
    function remove(id) {
      const index = tasks.findIndex((t) => t.id === id);
      if (index < 0) return;
      const [task] = tasks.splice(index, 1);
      if (editingId === id) reset();
      ctx2.persist(STORAGE_KEYS.tasks, tasks);
      ctx2.refresh();
      ctx2.notify("Tarefa exclu\xEDda.", "success", () => {
        if (!tasks.some((t) => t.id === id)) tasks.splice(Math.min(index, tasks.length), 0, task);
        ctx2.persist(STORAGE_KEYS.tasks, tasks);
        ctx2.refresh();
      });
    }
    $("#task-cancel").addEventListener("click", reset);
    form.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && editingId) {
        e.preventDefault();
        reset();
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearValidity();
      const raw = Object.fromEntries(
        Object.entries(fields).map(([key, field]) => [key, field.value])
      );
      if (!raw.description.trim()) {
        fields.description.setCustomValidity("Informe um t\xEDtulo com texto.");
        fields.description.reportValidity();
        return;
      }
      if (raw.dueTime && !raw.dueDate || raw.recurrence !== "none" && !raw.dueDate)
        fields.dueDate.setCustomValidity("Informe o prazo para usar hor\xE1rio ou recorr\xEAncia.");
      if (raw.startDate && raw.dueDate && raw.startDate > raw.dueDate)
        fields.dueDate.setCustomValidity("O prazo deve ser igual ou posterior ao in\xEDcio.");
      if (!form.reportValidity()) return;
      const original = tasks.find((t) => t.id === editingId);
      if (raw.clientId && !ctx2.state.clients.some((c) => c.id === raw.clientId) || raw.demandId && !ctx2.state.demands.some((d) => d.id === raw.demandId && d.clientId === raw.clientId)) {
        ctx2.notify("Selecione um cliente e uma demanda correspondentes.", "error");
        return;
      }
      if (raw.clientId) raw.category = "work";
      raw.subtasks = mergeSubtasks(raw.subtasks, original?.subtasks);
      const task = normalizeTask({
        ...original,
        ...raw,
        id: original?.id || uniqueId(),
        completed: raw.status === "completed",
        createdAt: original?.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      });
      if (!task) {
        ctx2.notify("Confira os dados da tarefa.", "error");
        return;
      }
      log(task, original ? "Dados da tarefa atualizados." : "Tarefa criada.");
      if ($("#task-update").value.trim()) log(task, $("#task-update").value.trim());
      const previousStatus = original?.status || "pending";
      const nextStatus = task.status;
      if (original) Object.assign(original, task);
      else tasks.push(task);
      if (previousStatus !== nextStatus) {
        const updated = original || task;
        updated.status = previousStatus;
        updated.completed = previousStatus === "completed";
        complete(updated, nextStatus === "completed", nextStatus);
      }
      ctx2.persist(STORAGE_KEYS.tasks, tasks);
      reset();
      activeFilter = "all";
      ["search", "filter-project"].forEach((id) => $(`#task-${id}`).value = "");
      ["filter-category", "filter-priority", "filter-period"].forEach(
        (id) => $(`#task-${id}`).value = "all"
      );
      ctx2.refresh();
      ctx2.notify(original ? "Tarefa atualizada." : "Tarefa cadastrada.");
      fields.description.focus();
    });
    $("#task-template").addEventListener("change", (event) => {
      const template = TEMPLATES[event.target.value];
      if (!template) {
        fields.description.placeholder = defaultPlaceholder;
        return;
      }
      if ((fields.description.value.trim() || fields.details.value.trim() || fields.subtasks.value.trim()) && !confirm("Aplicar modelo substituir\xE1 t\xEDtulo, natureza e checklist do formul\xE1rio. Continuar?"))
        return;
      fields.description.value = template.description;
      fields.description.placeholder = template.placeholder || defaultPlaceholder;
      fields.category.value = template.category;
      fields.subtasks.value = template.subtasks.join("\n");
      $("#task-advanced").open = template.subtasks.length > 0;
      fields.description.focus();
    });
    $$("[data-filter]").forEach(
      (button) => button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        render();
      })
    );
    [
      "search",
      "filter-category",
      "filter-priority",
      "filter-period",
      "filter-project",
      "sort"
    ].forEach((id) => $(`#task-${id}`).addEventListener("input", render));
    function row(task) {
      const li = element("li", "task-item");
      li.dataset.taskId = task.id;
      li.classList.toggle("completed", task.completed);
      li.classList.toggle("is-overdue", isOverdue(task));
      const checkbox = element("input", "task-checkbox");
      checkbox.dataset.uiKey = `task:${task.id}:completion`;
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.setAttribute("aria-label", `Concluir tarefa: ${task.description}`);
      checkbox.addEventListener("change", () => complete(task, checkbox.checked));
      const content = element("div", "task-content");
      content.append(element("strong", "task-text", task.description));
      const meta = element("div", "task-meta");
      const badge = (text, cls = "meta-pill") => element("span", cls, text);
      meta.append(badge(STATUSES[task.status]), badge(CATEGORIES[task.category]));
      if (task.project) meta.append(badge(task.project));
      if (task.clientId) meta.append(badge(ctx2.work.clientLabel(task.clientId)));
      if (task.demandId) meta.append(badge(ctx2.work.demandLabel(task.demandId)));
      if (task.category === "work" || task.clientId)
        meta.append(badge(WORK_TYPES[task.workType] || WORK_TYPES.task));
      if (task.waitingFor)
        content.append(element("p", "next-action", `Aguardando: ${task.waitingFor}`));
      if (task.followUpDate)
        meta.append(
          badge(
            `Acompanhar: ${formatDate(task.followUpDate)}`,
            `meta-pill ${!task.completed && task.followUpDate <= todayKey() ? "due-soon" : ""}`
          )
        );
      if (task.dueDate)
        meta.append(
          badge(
            `${isOverdue(task) ? "Vencida: " : ""}${formatDate(task.dueDate)}${task.dueTime ? " \xE0s " + task.dueTime : ""}`,
            `meta-pill ${isOverdue(task) ? "due-overdue" : ""}`
          )
        );
      if (task.recurrence !== "none") meta.append(badge(RECURRENCES[task.recurrence]));
      task.tags.forEach((tag) => meta.append(badge("#" + tag, "meta-pill tag-pill")));
      content.append(meta);
      if (task.nextAction)
        content.append(element("p", "next-action", `Pr\xF3ximo passo: ${task.nextAction}`));
      if (task.details || task.subtasks.length || task.history.length || task.estimatedMinutes || task.actualMinutes) {
        const details = element("details", "task-extra");
        details.dataset.uiKey = `task:${task.id}:details`;
        details.append(
          element(
            "summary",
            "",
            `Detalhes${task.subtasks.length ? ` \xB7 ${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length} etapas` : ""}`
          )
        );
        details.querySelector("summary").dataset.uiKey = `task:${task.id}:summary`;
        if (task.details) details.append(element("p", "task-details-text", task.details));
        if (task.estimatedMinutes || task.actualMinutes)
          details.append(
            element(
              "p",
              "help-text",
              `Estimado: ${task.estimatedMinutes} min \xB7 Realizado: ${task.actualMinutes} min`
            )
          );
        for (const sub of task.subtasks) {
          const label = element("label", "subtask-row");
          const check = element("input");
          check.dataset.uiKey = `task:${task.id}:subtask:${sub.id}`;
          check.type = "checkbox";
          check.checked = sub.completed;
          check.addEventListener("change", () => {
            sub.completed = check.checked;
            log(task, `${sub.completed ? "Conclu\xEDda" : "Reaberta"} etapa: ${sub.text}`);
            ctx2.persist(STORAGE_KEYS.tasks, tasks);
            ctx2.refresh();
          });
          label.append(check, element("span", "", sub.text));
          details.append(label);
        }
        if (task.history.length) {
          const history = element("details", "history");
          history.dataset.uiKey = `task:${task.id}:history`;
          history.append(element("summary", "", "Hist\xF3rico"));
          history.querySelector("summary").dataset.uiKey = `task:${task.id}:history-summary`;
          for (const entry of [...task.history].reverse())
            history.append(
              element(
                "p",
                "help-text",
                `${new Date(entry.at).toLocaleString("pt-BR")} \u2014 ${entry.text}`
              )
            );
          details.append(history);
        }
        content.append(details);
      }
      const actions = element("div", "item-actions");
      const statusLabel = element("label", "task-status-control", "Andamento");
      const statusSelect = element("select", "form-select task-status-select");
      statusSelect.dataset.uiKey = `task:${task.id}:status`;
      statusSelect.setAttribute("aria-label", `Andamento da tarefa: ${task.description}`);
      for (const [value, label] of Object.entries(STATUSES)) {
        const option = element("option", "", label);
        option.value = value;
        statusSelect.append(option);
      }
      statusSelect.value = task.status;
      statusSelect.addEventListener("change", () => {
        const status = statusSelect.value;
        complete(task, status === "completed", status);
        ctx2.notify(`Andamento alterado para ${STATUSES[status]}.`);
      });
      statusLabel.append(statusSelect);
      const priority = badge(PRIORITIES[task.priority], "task-priority-badge");
      priority.dataset.priority = task.priority;
      actions.append(
        statusLabel,
        priority,
        actionButton(
          `Editar tarefa: ${task.description}`,
          "pencil-square",
          () => edit(task.id),
          "secondary",
          `task:${task.id}:edit`
        ),
        actionButton(
          `Excluir tarefa: ${task.description}`,
          "trash3",
          () => remove(task.id),
          "danger",
          `task:${task.id}:delete`
        )
      );
      li.append(checkbox, content, actions);
      return li;
    }
    function render() {
      syncWorkOptions();
      const visible = selectTasks(tasks, {
        query: $("#task-search").value,
        category: $("#task-filter-category").value,
        priority: $("#task-filter-priority").value,
        period: $("#task-filter-period").value,
        project: $("#task-filter-project").value,
        status: activeFilter,
        sort: $("#task-sort").value,
        clients: ctx2.state.clients,
        demands: ctx2.state.demands
      });
      replacePreservingState($("#task-list"), visible.map(row));
      $("#task-total-badge").textContent = `${visible.length} / ${tasks.length}`;
      $("#empty-state").hidden = visible.length > 0;
      $("#empty-state-text").textContent = tasks.length ? "Nenhuma tarefa corresponde aos filtros." : "Nenhuma tarefa cadastrada. Comece pelo pr\xF3ximo passo.";
      $$("[data-filter]").forEach((button) => {
        const active = button.dataset.filter === activeFilter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
    return { render, edit, reset, row, createFor };
  }

  // src/js/agenda.js
  function initAgenda(ctx2) {
    const { meetings, celebrations } = ctx2.state;
    let editingMeetingId = null, editingCelebrationId = null;
    const { persist: persist2, notify: showMessage, navigate: showView, refresh: renderAll } = ctx2;
    const meetingForm = $("#meeting-form");
    const meetingFields = {
      title: $("#meeting-title"),
      date: $("#meeting-date"),
      start: $("#meeting-start"),
      end: $("#meeting-end"),
      category: $("#meeting-category"),
      project: $("#meeting-project"),
      location: $("#meeting-location"),
      details: $("#meeting-details"),
      clientId: $("#meeting-client")
    };
    function syncClients(value = meetingFields.clientId.value) {
      const first = element("option", "", "Sem cliente");
      first.value = "";
      meetingFields.clientId.replaceChildren(
        first,
        ...ctx2.state.clients.filter((c) => !c.archived || c.id === value).map((c) => {
          const option = element("option", "", c.name);
          option.value = c.id;
          return option;
        })
      );
      meetingFields.clientId.value = value;
    }
    function resetMeetingForm() {
      meetingForm.reset();
      editingMeetingId = null;
      meetingFields.end.setCustomValidity("");
      meetingFields.date.value = $("#agenda-date").value || todayKey();
      $("#meeting-form-heading").textContent = "Novo compromisso";
      $("#meeting-submit").textContent = "Adicionar compromisso";
      $("#meeting-cancel").hidden = true;
    }
    meetingFields.end.addEventListener("input", () => meetingFields.end.setCustomValidity(""));
    meetingFields.start.addEventListener("input", () => meetingFields.end.setCustomValidity(""));
    $("#meeting-cancel").addEventListener("click", resetMeetingForm);
    meetingForm.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && editingMeetingId) {
        event.preventDefault();
        resetMeetingForm();
      }
    });
    function editMeeting(id) {
      const meeting = meetings.find((item) => item.id === id);
      if (!meeting) return;
      editingMeetingId = id;
      syncClients(meeting.clientId);
      for (const [name, field] of Object.entries(meetingFields)) {
        field.value = name === "start" ? meeting.startTime : name === "end" ? meeting.endTime : name === "title" ? meeting.title : meeting[name] || "";
      }
      meetingFields.end.setCustomValidity("");
      $("#meeting-form-heading").textContent = "Editar compromisso";
      $("#meeting-submit").textContent = "Salvar altera\xE7\xF5es";
      $("#meeting-cancel").hidden = false;
      showView("agenda");
      meetingForm.scrollIntoView({ behavior: "smooth", block: "start" });
      meetingFields.title.focus({ preventScroll: true });
    }
    meetingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      meetingFields.end.setCustomValidity("");
      if (!meetingForm.reportValidity()) return;
      if (meetingFields.end.value <= meetingFields.start.value) {
        meetingFields.end.setCustomValidity("O t\xE9rmino deve ser posterior ao in\xEDcio.");
        meetingFields.end.reportValidity();
        return;
      }
      const original = meetings.find((item) => item.id === editingMeetingId);
      const meeting = normalizeMeeting({
        id: original?.id || uniqueId(),
        title: meetingFields.title.value,
        date: meetingFields.date.value,
        startTime: meetingFields.start.value,
        endTime: meetingFields.end.value,
        category: meetingFields.category.value,
        project: meetingFields.project.value,
        clientId: meetingFields.clientId.value,
        details: meetingFields.details.value,
        location: meetingFields.location.value
      });
      if (!meeting) {
        showMessage("Confira os dados do compromisso.", "error");
        return;
      }
      if (original) Object.assign(original, meeting);
      else meetings.push(meeting);
      $("#agenda-date").value = meeting.date;
      persist2(STORAGE_KEYS.meetings, meetings);
      resetMeetingForm();
      renderAll();
      showMessage(original ? "Compromisso atualizado." : "Compromisso agendado.");
    });
    function deleteMeeting(id) {
      const meeting = meetings.find((item) => item.id === id);
      if (!meeting || !confirm(`Excluir o compromisso "${meeting.title}"?`)) return;
      meetings.splice(0, meetings.length, ...meetings.filter((item) => item.id !== id));
      if (editingMeetingId === id) resetMeetingForm();
      persist2(STORAGE_KEYS.meetings, meetings);
      renderAll();
      showMessage("Compromisso exclu\xEDdo.");
    }
    function safeHttpUrl(location) {
      try {
        const url = new URL(location);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
      } catch {
        return null;
      }
    }
    function meetingRow(meeting) {
      const row = element("article", "event-row");
      const content = element("div", "event-info");
      content.append(element("strong", "event-title", meeting.title));
      content.append(
        element(
          "p",
          "event-subtitle",
          `${formatDate(meeting.date)} \u2022 ${meeting.startTime}\u2013${meeting.endTime} \u2022 ${CATEGORIES[meeting.category]}`
        )
      );
      if (meeting.project) content.append(element("p", "event-note", `Projeto: ${meeting.project}`));
      if (meeting.details) content.append(element("p", "event-note", meeting.details));
      if (meeting.location) {
        const locationText = element("p", "event-note");
        const href = safeHttpUrl(meeting.location);
        if (href) {
          const link = element("a", "event-link", meeting.location);
          link.href = href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          locationText.append(link);
        } else locationText.textContent = `Local: ${meeting.location}`;
        content.append(locationText);
      }
      const actions = element("div", "item-actions");
      actions.append(
        actionButton(
          `Editar compromisso: ${meeting.title}`,
          "pencil-square",
          () => editMeeting(meeting.id)
        )
      );
      actions.append(
        actionButton(
          `Excluir compromisso: ${meeting.title}`,
          "trash3",
          () => deleteMeeting(meeting.id),
          "danger"
        )
      );
      row.append(element("span", "legend-dot type-meeting"), content, actions);
      return row;
    }
    function renderAgenda() {
      syncClients();
      const target = $("#agenda-content");
      target.replaceChildren();
      const day = $("#agenda-date").value || todayKey();
      const sorted = [...meetings].sort(
        (a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
      );
      const daily = sorted.filter((item) => item.date === day);
      const upcoming = sorted.filter((item) => item.date > day).slice(0, 8);
      target.append(element("h4", "list-subheading", `Dia ${formatDate(day)}`));
      if (daily.length) daily.forEach((item) => target.append(meetingRow(item)));
      else target.append(renderEmpty("Nenhum compromisso nesta data."));
      target.append(element("h4", "list-subheading mt-3", "Pr\xF3ximos compromissos"));
      if (upcoming.length) upcoming.forEach((item) => target.append(meetingRow(item)));
      else target.append(renderEmpty("Nenhum pr\xF3ximo compromisso cadastrado."));
    }
    $("#agenda-date").addEventListener("input", () => {
      resetMeetingForm();
      renderAgenda();
    });
    $("#agenda-today").addEventListener("click", () => {
      $("#agenda-date").value = todayKey();
      resetMeetingForm();
      renderAgenda();
    });
    const celebrationForm = $("#celebration-form");
    const celebrationFields = {
      name: $("#celebration-name"),
      kind: $("#celebration-kind"),
      date: $("#celebration-date"),
      notes: $("#celebration-notes")
    };
    function resetCelebrationForm() {
      celebrationForm.reset();
      editingCelebrationId = null;
      $("#celebration-form-heading").textContent = "Anivers\xE1rios e datas especiais";
      $("#celebration-submit").textContent = "Adicionar data";
      $("#celebration-cancel").hidden = true;
    }
    $("#celebration-cancel").addEventListener("click", resetCelebrationForm);
    celebrationForm.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && editingCelebrationId) {
        event.preventDefault();
        resetCelebrationForm();
      }
    });
    function editCelebration(id) {
      const celebration = celebrations.find((item) => item.id === id);
      if (!celebration) return;
      editingCelebrationId = id;
      Object.entries(celebrationFields).forEach(([name, field]) => {
        field.value = celebration[name] || "";
      });
      $("#celebration-form-heading").textContent = "Editar data especial";
      $("#celebration-submit").textContent = "Salvar altera\xE7\xF5es";
      $("#celebration-cancel").hidden = false;
      showView("agenda");
      celebrationForm.scrollIntoView({ behavior: "smooth", block: "start" });
      celebrationFields.name.focus({ preventScroll: true });
    }
    celebrationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!celebrationForm.reportValidity()) return;
      const original = celebrations.find((item) => item.id === editingCelebrationId);
      const celebration = normalizeCelebration({
        id: original?.id || uniqueId(),
        name: celebrationFields.name.value,
        kind: celebrationFields.kind.value,
        date: celebrationFields.date.value,
        notes: celebrationFields.notes.value
      });
      if (!celebration) {
        showMessage("Confira a data comemorativa.", "error");
        return;
      }
      if (original) Object.assign(original, celebration);
      else celebrations.push(celebration);
      persist2(STORAGE_KEYS.celebrations, celebrations);
      resetCelebrationForm();
      renderAll();
      showMessage(original ? "Data especial atualizada." : "Data especial cadastrada.");
    });
    function deleteCelebration(id) {
      const celebration = celebrations.find((item) => item.id === id);
      if (!celebration || !confirm(`Excluir "${celebration.name}"?`)) return;
      celebrations.splice(0, celebrations.length, ...celebrations.filter((item) => item.id !== id));
      if (editingCelebrationId === id) resetCelebrationForm();
      persist2(STORAGE_KEYS.celebrations, celebrations);
      renderAll();
      showMessage("Data especial exclu\xEDda.");
    }
    function nextCelebrationDate(celebration) {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const year = yearlyDate(celebration, currentYear) < todayKey() ? currentYear + 1 : currentYear;
      return yearlyDate(celebration, year);
    }
    function renderCelebrations() {
      const target = $("#celebration-content");
      target.replaceChildren();
      if (!celebrations.length) {
        target.append(renderEmpty("Nenhuma data especial cadastrada."));
        return;
      }
      [...celebrations].sort((a, b) => nextCelebrationDate(a).localeCompare(nextCelebrationDate(b))).forEach((item) => {
        const row = element("article", "event-row");
        const info = element("div", "event-info");
        info.append(element("strong", "event-title", item.name));
        const nextDate = nextCelebrationDate(item);
        info.append(
          element(
            "p",
            "event-subtitle",
            `${KINDS[item.kind]} \u2022 Pr\xF3xima ocorr\xEAncia: ${formatDate(nextDate)}`
          )
        );
        if (item.notes) info.append(element("p", "event-note", item.notes));
        const actions = element("div", "item-actions");
        actions.append(
          actionButton(`Editar ${item.name}`, "pencil-square", () => editCelebration(item.id))
        );
        actions.append(
          actionButton(
            `Excluir ${item.name}`,
            "trash3",
            () => deleteCelebration(item.id),
            "danger"
          )
        );
        row.append(element("span", `legend-dot type-${item.kind}`), info, actions);
        target.append(row);
      });
    }
    return {
      renderAgenda,
      renderCelebrations,
      editMeeting,
      editCelebration,
      resetMeetingForm,
      resetCelebrationForm,
      meetingFields,
      meetingRow
    };
  }

  // src/js/calendar.js
  var WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\xE1b"];
  var MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
  function renderCalendar({
    container,
    heading,
    year,
    month,
    selectedDate,
    getEvents,
    onSelect
  }) {
    const monthName = MONTH_FORMAT.format(new Date(year, month, 1, 12));
    heading.textContent = monthName[0].toLocaleUpperCase("pt-BR") + monthName.slice(1);
    const fragment = document.createDocumentFragment();
    for (const name of WEEKDAYS) {
      const header = document.createElement("div");
      header.className = "calendar-weekday";
      header.textContent = name;
      fragment.append(header);
    }
    const first = new Date(year, month, 1, 12);
    first.setDate(first.getDate() - first.getDay());
    const today = localKey(/* @__PURE__ */ new Date());
    for (let index = 0; index < 42; index++) {
      const date = new Date(first);
      date.setDate(first.getDate() + index);
      const key = localKey(date);
      const events = getEvents(key);
      const outside = date.getMonth() !== month;
      const selected = key === selectedDate;
      const isToday = key === today;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.classList.toggle("is-outside", outside);
      button.classList.toggle("is-today", isToday);
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute("aria-label", `${formatDay(key)}. ${events.length} evento(s)`);
      button.dataset.date = key;
      button.dataset.uiKey = `day:${key}`;
      const number = document.createElement("span");
      number.className = "calendar-number";
      number.textContent = String(date.getDate());
      button.append(number);
      for (const event of events.slice(0, 2)) {
        const chip = document.createElement("span");
        chip.className = `calendar-chip type-${event.type}`;
        chip.textContent = `${event.time ? event.time + " " : ""}${event.title}`;
        chip.title = event.title;
        button.append(chip);
      }
      if (events.length > 2) {
        const more = document.createElement("span");
        more.className = "calendar-more";
        more.textContent = `+ ${events.length - 2} outros`;
        button.append(more);
      }
      button.addEventListener("click", () => onSelect(key));
      fragment.append(button);
    }
    replacePreservingState(container, [fragment]);
  }

  // src/js/events.js
  function initEvents(ctx2) {
    const { tasks, meetings, celebrations } = ctx2.state;
    const showView = ctx2.navigate;
    const TYPE_LABELS = {
      task: "Tarefa",
      meeting: "Compromisso",
      birthday: "Anivers\xE1rio",
      special: "Data especial",
      holiday: "Feriado nacional"
    };
    let currentMonth = (/* @__PURE__ */ new Date()).getMonth(), currentYear = (/* @__PURE__ */ new Date()).getFullYear(), selectedDate = todayKey();
    const holidayYears = /* @__PURE__ */ new Map();
    function eventsForDate(day) {
      if (!validDate(day)) return [];
      const year = Number(day.slice(0, 4));
      const events = [];
      for (const task of tasks) {
        if (task.dueDate === day)
          events.push({
            type: "task",
            id: task.id,
            title: task.description,
            time: task.dueTime,
            note: task.details,
            completed: task.completed
          });
      }
      for (const meeting of meetings) {
        if (meeting.date === day)
          events.push({
            type: "meeting",
            id: meeting.id,
            title: meeting.title,
            time: meeting.startTime,
            note: meeting.details
          });
      }
      for (const celebration of celebrations) {
        if (yearlyDate(celebration, year) === day) {
          const age = year - Number(celebration.date.slice(0, 4));
          const ageText = celebration.kind === "birthday" && age >= 0 ? ` \u2022 ${age} ano(s)` : "";
          events.push({
            type: celebration.kind,
            id: celebration.id,
            title: celebration.name,
            time: "",
            note: `${celebration.notes}${ageText}`.trim()
          });
        }
      }
      const holidays = holidayYears.get(year)?.holidays || fallbackHolidays(year);
      for (const holiday of holidays) {
        if (holiday.date === day)
          events.push({
            type: "holiday",
            id: holiday.date,
            title: holiday.name,
            time: "",
            note: "Feriado nacional brasileiro"
          });
      }
      return events.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    }
    function eventRow(event) {
      const row = element("article", `event-row event-type-${event.type}`);
      const info = element("div", "event-info");
      const title = event.completed ? `${event.title} \u2713` : event.title;
      info.append(element("strong", "event-title", title));
      info.append(
        element(
          "p",
          "event-subtitle",
          `${TYPE_LABELS[event.type]}${event.time ? ` \u2022 ${event.time}` : ""}`
        )
      );
      if (event.note) info.append(element("p", "event-note", event.note));
      const actions = element("div", "item-actions");
      if (event.type === "task")
        actions.append(
          actionButton(
            `Editar tarefa ${event.title}`,
            "pencil-square",
            () => ctx2.tasks.edit(event.id)
          )
        );
      if (event.type === "meeting")
        actions.append(
          actionButton(
            `Editar compromisso ${event.title}`,
            "pencil-square",
            () => ctx2.agenda.editMeeting(event.id)
          )
        );
      if (["birthday", "special"].includes(event.type))
        actions.append(
          actionButton(
            `Editar ${event.title}`,
            "pencil-square",
            () => ctx2.agenda.editCelebration(event.id)
          )
        );
      row.append(element("span", `legend-dot type-${event.type}`), info, actions);
      return row;
    }
    function renderDayEvents() {
      $("#calendar-selected-heading").textContent = formatDay(selectedDate);
      const target = $("#calendar-day-events");
      const events = eventsForDate(selectedDate);
      target.replaceChildren(
        ...events.length ? events.map(eventRow) : [renderEmpty("Nenhum evento neste dia. Selecione + Compromisso para agendar.")]
      );
    }
    function renderCalendarUI() {
      renderCalendar({
        container: $("#calendar-grid"),
        heading: $("#calendar-month"),
        year: currentYear,
        month: currentMonth,
        selectedDate,
        getEvents: eventsForDate,
        onSelect(day) {
          selectedDate = day;
          const date = /* @__PURE__ */ new Date(`${day}T12:00:00`);
          if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) {
            currentYear = date.getFullYear();
            currentMonth = date.getMonth();
            ensureHolidays(currentYear);
          }
          renderCalendarUI();
        }
      });
      renderDayEvents();
      const source = holidayYears.get(currentYear)?.source;
      $("#holidays-status").textContent = source === "BrasilAPI" ? "Feriados nacionais do Brasil consultados na BrasilAPI. Pontos facultativos n\xE3o s\xE3o inclu\xEDdos." : "Feriados nacionais do Brasil calculados localmente (consulta on-line em andamento ou indispon\xEDvel). Feriados estaduais e municipais n\xE3o est\xE3o inclu\xEDdos.";
    }
    async function ensureHolidays(year) {
      if (holidayYears.has(year)) return;
      const result = await getNationalHolidays(year);
      holidayYears.set(year, result);
      if (year === currentYear) renderCalendarUI();
      if (year === (/* @__PURE__ */ new Date()).getFullYear()) ctx2.renderDashboard();
    }
    function changeMonth(offset) {
      const next = new Date(currentYear, currentMonth + offset, 1, 12);
      currentYear = next.getFullYear();
      currentMonth = next.getMonth();
      selectedDate = localKey(next);
      renderCalendarUI();
      ensureHolidays(currentYear);
    }
    function selectToday() {
      const now = /* @__PURE__ */ new Date();
      currentMonth = now.getMonth();
      currentYear = now.getFullYear();
      selectedDate = todayKey();
      renderCalendarUI();
      ensureHolidays(currentYear);
    }
    function openMeetingForSelectedDate() {
      showView("agenda");
      ctx2.agenda.resetMeetingForm();
      $("#agenda-date").value = selectedDate;
      ctx2.agenda.meetingFields.date.value = selectedDate;
      ctx2.agenda.renderAgenda();
      ctx2.agenda.meetingFields.title.focus();
      $("#meeting-form").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $("#calendar-prev").addEventListener("click", () => changeMonth(-1));
    $("#calendar-next").addEventListener("click", () => changeMonth(1));
    $("#calendar-today").addEventListener("click", selectToday);
    $("#calendar-add").addEventListener("click", openMeetingForSelectedDate);
    $("#calendar-day-add").addEventListener("click", openMeetingForSelectedDate);
    return {
      render: renderCalendarUI,
      eventsForDate,
      eventRow,
      start: () => ensureHolidays(currentYear)
    };
  }

  // src/js/backup.js
  function parseBackup(payload) {
    if (!payload || !["Ordavik", "TaskFlow"].includes(payload.app) || ![1, 2].includes(payload.version))
      throw new Error("Formato de backup n\xE3o reconhecido.");
    const result = {};
    for (const [name, normalize] of Object.entries({
      tasks: normalizeTask,
      meetings: normalizeMeeting,
      celebrations: normalizeCelebration,
      clients: normalizeClient,
      demands: normalizeDemand
    })) {
      const list = payload[name] ?? (payload.version === 1 && ["clients", "demands"].includes(name) ? [] : void 0);
      if (!Array.isArray(list) || list.length > 5e3)
        throw new Error("Cole\xE7\xE3o ausente ou limite excedido.");
      const ids = /* @__PURE__ */ new Set();
      result[name] = list.map((raw) => {
        const item = normalize(raw);
        if (!item || ids.has(item.id))
          throw new Error("Backup cont\xE9m registros inv\xE1lidos ou IDs duplicados.");
        ids.add(item.id);
        return item;
      });
    }
    validateWorkLinks(result);
    return result;
  }
  function restoreRecords(collections, storage = localStorage) {
    const snapshot = Object.fromEntries(
      Object.keys(collections).map((name) => [name, storage.getItem(STORAGE_KEYS[name])])
    );
    try {
      for (const [name, list] of Object.entries(collections))
        storage.setItem(STORAGE_KEYS[name], JSON.stringify(list));
    } catch (error) {
      let rollbackFailed = false;
      for (const [name, value] of Object.entries(snapshot)) {
        try {
          if (value === null) storage.removeItem(STORAGE_KEYS[name]);
          else storage.setItem(STORAGE_KEYS[name], value);
        } catch {
          rollbackFailed = true;
        }
      }
      throw new Error(
        rollbackFailed ? "Restaura\xE7\xE3o interrompida. A recupera\xE7\xE3o local foi parcial; preserve seu arquivo de backup." : "Restaura\xE7\xE3o interrompida; os dados anteriores foram preservados."
      );
    }
  }
  function initBackup(ctx2) {
    $("#export-backup").addEventListener("click", () => {
      const rawStorage = {};
      for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        try {
          rawStorage[name] = localStorage.getItem(key);
        } catch {
          rawStorage[name] = null;
        }
      }
      const contents = JSON.stringify(
        {
          app: BRAND.name,
          version: 2,
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          ...ctx2.state,
          rawStorage
        },
        null,
        2
      );
      const url = URL.createObjectURL(
        new Blob([contents], { type: "application/json;charset=utf-8" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `ordavik-backup-${todayKey()}.json`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
      ctx2.notify(
        "Backup exportado. O arquivo inclui os dados originais dispon\xEDveis para recupera\xE7\xE3o."
      );
    });
    $("#import-backup").addEventListener("click", () => $("#backup-file").click());
    $("#backup-file").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      try {
        if (file.size > 5e6) throw new Error("O backup ultrapassa 5 MB.");
        const restored = parseBackup(JSON.parse(await file.text()));
        if (!confirm(
          "Restaurar substituir\xE1 tarefas, compromissos, datas especiais, clientes e demandas deste navegador. Backups antigos n\xE3o possuem clientes nem demandas. Exporte um backup antes. Continuar?"
        ))
          return;
        restoreRecords(restored);
        for (const [name, list] of Object.entries(restored))
          ctx2.state[name].splice(0, ctx2.state[name].length, ...list);
        ctx2.clearStorageProblems();
        ctx2.tasks.reset();
        ctx2.agenda.resetMeetingForm();
        ctx2.agenda.resetCelebrationForm();
        ctx2.work.reset();
        ctx2.refresh();
        ctx2.notify("Backup restaurado com sucesso.");
      } catch (error) {
        ctx2.notify(`Falha na restaura\xE7\xE3o: ${error.message}`, "error");
      }
    });
  }

  // src/js/work.js
  function initWork(ctx2) {
    const { clients, demands, tasks, meetings } = ctx2.state;
    let selectedClient = "", editingClient = "", editingDemand = "", tab = "summary";
    let notesSaved = "";
    function makeForm(id, definitions, submitLabel) {
      const form = $(id), fields = {};
      for (const [name, label, type = "text", choices] of definitions) {
        const wrapper = element("div", `form-field ${type === "textarea" ? "span-2" : ""}`), input = element(
          type === "textarea" ? "textarea" : type === "select" ? "select" : "input",
          "form-control"
        );
        input.id = `${form.id}-${name}`;
        input.name = name;
        const text = element("label", "", label);
        text.htmlFor = input.id;
        if (type === "select")
          for (const [value, title] of Object.entries(choices || {})) {
            const option = element("option", "", title);
            option.value = value;
            input.append(option);
          }
        else if (type === "textarea") {
          input.rows = 3;
          input.maxLength = name === "notes" && form.id === "work-client-form" ? 5e3 : 2e3;
        } else {
          input.type = type;
          input.maxLength = name === "name" ? 80 : name === "title" ? 140 : 200;
        }
        if (["name", "title"].includes(name)) input.required = true;
        wrapper.append(text, input);
        form.append(wrapper);
        fields[name] = input;
      }
      const actions = element("div", "form-actions span-2"), cancel = element("button", "btn btn-outline-secondary", "Cancelar"), save = element("button", "btn btn-primary", submitLabel);
      cancel.type = "button";
      save.type = "submit";
      actions.append(cancel, save);
      form.append(actions);
      return { form, fields, cancel, save };
    }
    const clientForm = makeForm(
      "#work-client-form",
      [
        ["name", "Nome do cliente *"],
        ["notes", "Anota\xE7\xF5es gerais", "textarea"]
      ],
      "Salvar cliente"
    );
    const demandForm = makeForm(
      "#work-demand-form",
      [
        ["clientId", "Cliente *", "select"],
        ["title", "T\xEDtulo da demanda *"],
        ["ticket", "Chamado / refer\xEAncia"],
        ["status", "Andamento", "select", STATUSES],
        ["priority", "Prioridade", "select", PRIORITIES],
        ["dueDate", "Prazo de entrega", "date"],
        ["waitingFor", "Aguardando quem?"],
        ["followUpDate", "Pr\xF3ximo acompanhamento", "date"],
        ["environment", "Ambiente / sistema"],
        ["objective", "Objetivo", "textarea"],
        ["currentBehavior", "Comportamento atual", "textarea"],
        ["expectedResult", "Resultado esperado", "textarea"],
        ["evidence", "Evid\xEAncias e links de refer\xEAncia", "textarea"],
        ["nextAction", "Pr\xF3xima a\xE7\xE3o", "textarea"],
        ["acceptance", "Crit\xE9rio de conclus\xE3o", "textarea"],
        ["notes", "Hist\xF3rico e anota\xE7\xF5es da demanda", "textarea"]
      ],
      "Salvar demanda"
    );
    demandForm.fields.clientId.required = true;
    function setOptions(select, entries, placeholder) {
      const current = select.value;
      const options = entries.map(([id, label]) => {
        const option = element("option", "", label);
        option.value = id;
        return option;
      });
      const first = element("option", "", placeholder);
      first.value = "";
      select.replaceChildren(first, ...options);
      select.value = [...select.options].some((o) => o.value === current) ? current : "";
    }
    function reset() {
      selectedClient = "";
      editingClient = "";
      editingDemand = "";
      tab = "summary";
      clientForm.form.reset();
      demandForm.form.reset();
      $("#work-client-editor").open = false;
      $("#work-demand-editor").open = false;
      $("#work-task-search").value = "";
      $("#work-demand-filter").value = "";
    }
    function openClient(id) {
      selectedClient = id;
      $("#work-demand-filter").value = "";
      ctx2.navigate("work");
      render();
    }
    function openTask(demandId = "") {
      const demand = demands.find((d) => d.id === demandId);
      ctx2.tasks.createFor(demand?.clientId || selectedClient, demandId);
    }
    function clientLabel(id) {
      return clients.find((c) => c.id === id)?.name || "Cliente n\xE3o encontrado";
    }
    function demandLabel(id) {
      return demands.find((d) => d.id === id)?.title || "Demanda n\xE3o encontrada";
    }
    function scopeTasks() {
      return tasks.filter(
        (t) => selectedClient ? t.clientId === selectedClient : t.category === "work" || t.clientId
      );
    }
    function editClient(client) {
      editingClient = client?.id || "";
      clientForm.form.reset();
      for (const [key, input] of Object.entries(clientForm.fields)) input.value = client?.[key] || "";
      $("#work-client-editor").open = true;
      clientForm.fields.name.focus();
    }
    clientForm.cancel.addEventListener("click", () => {
      editingClient = "";
      clientForm.form.reset();
      $("#work-client-editor").open = false;
    });
    clientForm.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = clientForm.fields.name.value.trim();
      if (!name) {
        ctx2.notify("Informe o nome do cliente.", "error");
        return;
      }
      if (clients.some(
        (c) => c.id !== editingClient && c.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR")
      )) {
        ctx2.notify("J\xE1 existe um cliente com esse nome, inclusive entre os arquivados.", "error");
        return;
      }
      const original = clients.find((c) => c.id === editingClient);
      const client = normalizeClient({
        ...original,
        id: original?.id || uniqueId(),
        name,
        notes: clientForm.fields.notes.value
      });
      if (original) Object.assign(original, client);
      else clients.push(client);
      ctx2.persist(STORAGE_KEYS.clients, clients);
      selectedClient = client.id;
      editingClient = "";
      clientForm.form.reset();
      $("#work-client-editor").open = false;
      ctx2.refresh();
      ctx2.notify("Cliente salvo.");
    });
    $("#work-add-client").addEventListener("click", () => editClient());
    $("#work-edit-client").addEventListener(
      "click",
      () => editClient(clients.find((c) => c.id === selectedClient))
    );
    for (const [button, property] of [
      ["#work-archive-client", "archived"],
      ["#work-favorite-client", "favorite"]
    ])
      $(button).addEventListener("click", () => {
        const client = clients.find((c) => c.id === selectedClient);
        if (!client) return;
        client[property] = !client[property];
        ctx2.persist(STORAGE_KEYS.clients, clients);
        ctx2.refresh();
      });
    function editDemand(demand) {
      editingDemand = demand?.id || "";
      demandForm.form.reset();
      setOptions(
        demandForm.fields.clientId,
        clients.filter((c) => !c.archived || c.id === demand?.clientId).map((c) => [c.id, c.name]),
        "Selecione um cliente"
      );
      for (const [key, input] of Object.entries(demandForm.fields))
        input.value = demand?.[key] ?? (key === "clientId" ? selectedClient : key === "status" ? "pending" : key === "priority" ? "medium" : "");
      demandForm.fields.clientId.disabled = Boolean(demand);
      $("#work-demand-editor").open = true;
      demandForm.fields.title.focus();
    }
    $("#work-add-demand").addEventListener("click", () => editDemand());
    demandForm.cancel.addEventListener("click", () => {
      editingDemand = "";
      demandForm.form.reset();
      $("#work-demand-editor").open = false;
    });
    demandForm.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const raw = Object.fromEntries(
        Object.entries(demandForm.fields).map(([key, input]) => [key, input.value])
      );
      const original = demands.find((d) => d.id === editingDemand);
      const demand = normalizeDemand({
        ...original,
        ...raw,
        id: original?.id || uniqueId(),
        createdAt: original?.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      });
      if (!demand || !clients.some((c) => c.id === demand.clientId)) {
        ctx2.notify("Informe cliente e t\xEDtulo v\xE1lidos.", "error");
        return;
      }
      if (original) Object.assign(original, demand);
      else demands.push(demand);
      ctx2.persist(STORAGE_KEYS.demands, demands);
      selectedClient = demand.clientId;
      editingDemand = "";
      demandForm.form.reset();
      $("#work-demand-editor").open = false;
      tab = "demands";
      ctx2.refresh();
      ctx2.notify("Demanda salva.");
    });
    $("#work-add-task").addEventListener("click", () => openTask());
    $("#work-task-search").addEventListener("input", renderTasks);
    $("#work-task-status").addEventListener("change", renderTasks);
    $("#work-demand-filter").addEventListener("change", renderTasks);
    $("#work-show-archived").addEventListener("change", render);
    $("#work-all-clients").addEventListener("click", () => openClient(""));
    $$("[data-work-tab]").forEach(
      (button) => button.addEventListener("click", () => {
        tab = button.dataset.workTab;
        render();
      })
    );
    $("#work-notes-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const client = clients.find((c) => c.id === selectedClient);
      if (!client) return;
      client.notes = $("#work-notes").value.trim().slice(0, 5e3);
      if (editingClient === client.id) clientForm.fields.notes.value = client.notes;
      notesSaved = client.notes;
      $("#work-notes").value = client.notes;
      ctx2.persist(STORAGE_KEYS.clients, clients);
      ctx2.notify("Anota\xE7\xF5es salvas.");
    });
    function renderTasks() {
      const query = $("#work-task-search").value.trim().toLocaleLowerCase("pt-BR"), status = $("#work-task-status").value, demandId = $("#work-demand-filter").value;
      const selected = scopeTasks().filter(
        (t) => (!demandId || (demandId === "unassigned" ? !t.demandId : t.demandId === demandId)) && (!status || t.status === status) && [t.description, t.project, t.waitingFor, t.nextAction].join(" ").toLocaleLowerCase("pt-BR").includes(query)
      );
      replacePreservingState(
        $("#work-tasks"),
        selected.length ? selected.map(ctx2.tasks.row) : [renderEmpty("Nenhuma tarefa neste contexto.")]
      );
    }
    function demandCard(demand) {
      const card = element("article", "overview-card work-demand-card");
      card.append(
        element("h4", "panel-title", demand.title),
        element(
          "p",
          "help-text",
          `${clientLabel(demand.clientId)}${demand.ticket ? " \xB7 " + demand.ticket : ""}${demand.archived ? " \xB7 Arquivada" : ""}`
        )
      );
      const related = tasks.filter((t) => t.demandId === demand.id);
      card.append(
        element(
          "p",
          "help-text",
          `${related.filter((t) => t.completed).length}/${related.length} tarefas conclu\xEDdas${demand.dueDate ? " \xB7 Prazo: " + formatDate(demand.dueDate) : ""}`
        )
      );
      if (demand.waitingFor)
        card.append(element("p", "next-action", `Aguardando: ${demand.waitingFor}`));
      if (demand.followUpDate)
        card.append(element("p", "help-text", `Acompanhar em: ${formatDate(demand.followUpDate)}`));
      const select = element("select", "form-select");
      select.setAttribute("aria-label", `Andamento da demanda: ${demand.title}`);
      select.dataset.uiKey = `demand:${demand.id}:status`;
      for (const [value, label] of Object.entries(STATUSES)) {
        const option = element("option", "", label);
        option.value = value;
        select.append(option);
      }
      select.value = demand.status;
      select.addEventListener("change", () => {
        demand.status = select.value;
        if (editingDemand === demand.id) demandForm.fields.status.value = demand.status;
        ctx2.persist(STORAGE_KEYS.demands, demands);
        ctx2.refresh();
      });
      card.append(select);
      const details = element("details", "task-extra");
      details.dataset.uiKey = `demand:${demand.id}:details`;
      details.append(element("summary", "", "Contexto da demanda"));
      for (const [key, label] of [
        ["objective", "Objetivo"],
        ["currentBehavior", "Comportamento atual"],
        ["expectedResult", "Resultado esperado"],
        ["environment", "Ambiente"],
        ["evidence", "Evid\xEAncias e refer\xEAncias"],
        ["nextAction", "Pr\xF3xima a\xE7\xE3o"],
        ["acceptance", "Crit\xE9rio de conclus\xE3o"],
        ["notes", "Hist\xF3rico e anota\xE7\xF5es"]
      ])
        if (demand[key])
          details.append(
            element("strong", "", label),
            element("p", "task-details-text", demand[key])
          );
      card.append(details);
      const actions = element("div", "work-actions mt-3");
      const button = (label, callback) => {
        const node = element("button", "btn btn-sm btn-outline-secondary", label);
        node.type = "button";
        node.addEventListener("click", callback);
        return node;
      };
      actions.append(
        button("Ver tarefas", () => {
          selectedClient = demand.clientId;
          tab = "tasks";
          render();
          $("#work-demand-filter").value = demand.id;
          renderTasks();
        }),
        button("Adicionar tarefa", () => openTask(demand.id)),
        button("Editar demanda", () => editDemand(demand)),
        button(demand.archived ? "Reativar demanda" : "Arquivar demanda", () => {
          demand.archived = !demand.archived;
          ctx2.persist(STORAGE_KEYS.demands, demands);
          ctx2.refresh();
        })
      );
      card.append(actions);
      return card;
    }
    function render() {
      if (selectedClient && !clients.some((c) => c.id === selectedClient)) selectedClient = "";
      const client = clients.find((c) => c.id === selectedClient), showArchived = $("#work-show-archived").checked;
      const sorted = [...clients].filter((c) => showArchived || !c.archived || c.id === selectedClient).sort(
        (a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name, "pt-BR")
      );
      for (const target of ["#work-clients", "#work-client-shortcuts"]) {
        $(target).replaceChildren(
          ...sorted.map((c) => {
            const button = element(
              "button",
              `work-client-button ${c.id === selectedClient ? "is-active" : ""}`,
              `${c.favorite ? "\u2605 " : ""}${c.name}${c.archived ? " (arquivado)" : ""}`
            );
            button.type = "button";
            button.setAttribute("aria-pressed", String(c.id === selectedClient));
            button.addEventListener("click", () => openClient(c.id));
            return button;
          })
        );
      }
      $("#work-context-title").textContent = client ? client.name : "Vis\xE3o geral do trabalho";
      for (const id of ["#work-edit-client", "#work-archive-client", "#work-favorite-client"])
        $(id).hidden = !client;
      $("#work-archive-client").textContent = client?.archived ? "Reativar cliente" : "Arquivar cliente";
      $("#work-favorite-client").textContent = client?.favorite ? "Remover favorito" : "Favoritar";
      $$("[data-work-tab]").forEach((button) => {
        const active = button.dataset.workTab === tab;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      $$("[data-work-panel]").forEach((panel) => panel.hidden = panel.dataset.workPanel !== tab);
      const summary = workSummary(scopeTasks());
      const demandAttention = demands.filter(
        (d) => (!selectedClient || d.clientId === selectedClient) && !d.archived && d.status !== "completed" && (d.status === "waiting" || d.followUpDate && d.followUpDate <= todayKey())
      );
      $("#work-summary").replaceChildren(
        ...Object.entries({
          Pendentes: summary.pending,
          "Em espera": summary.waiting,
          Vencidas: summary.overdue,
          "Acompanhar agora": summary.followUps + demandAttention.filter((d) => d.followUpDate && d.followUpDate <= todayKey()).length,
          Conclu\u00EDdas: summary.completed
        }).map(([label, value]) => {
          const card = element("article", "stat-card");
          card.append(element("p", "", label), element("strong", "", String(value)));
          return card;
        })
      );
      const attention = scopeTasks().filter(
        (t) => !t.completed && (t.followUpDate && t.followUpDate <= todayKey() || t.status === "waiting" || isOverdue(t))
      );
      replacePreservingState(
        $("#work-attention"),
        attention.length ? attention.map(ctx2.tasks.row) : [renderEmpty("Nenhum retorno pendente neste contexto.")]
      );
      replacePreservingState(
        $("#work-demand-attention"),
        demandAttention.length ? demandAttention.map(demandCard) : [renderEmpty("Nenhuma demanda aguardando retorno ou acompanhamento.")]
      );
      const visibleDemands = demands.filter(
        (d) => (!selectedClient || d.clientId === selectedClient) && (showArchived || !d.archived)
      );
      replacePreservingState(
        $("#work-demands"),
        visibleDemands.length ? visibleDemands.map(demandCard) : [renderEmpty("Nenhuma demanda cadastrada neste contexto.")]
      );
      setOptions(
        $("#work-demand-filter"),
        [
          ["unassigned", "Tarefas avulsas"],
          ...demands.filter((d) => !selectedClient || d.clientId === selectedClient).map((d) => [d.id, d.title + (d.archived ? " (arquivada)" : "")])
        ],
        "Todas as demandas"
      );
      renderTasks();
      const relatedMeetings = meetings.filter((m) => client ? m.clientId === client.id : m.category === "work" || m.clientId).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
      $("#work-agenda").replaceChildren(
        ...relatedMeetings.length ? relatedMeetings.map(ctx2.agenda.meetingRow) : [
          renderEmpty(
            "Nenhum compromisso de trabalho neste contexto. Selecione o cliente no cadastro da Agenda."
          )
        ]
      );
      $("#work-notes-form").hidden = !client;
      $("#work-notes-empty").hidden = Boolean(client);
      if ($("#work-notes").dataset.clientId !== selectedClient || $("#work-notes").value === notesSaved) {
        $("#work-notes").value = client?.notes || "";
        notesSaved = client?.notes || "";
        $("#work-notes").dataset.clientId = selectedClient;
      }
    }
    try {
      if (localStorage.getItem(STORAGE_KEYS.clients) === null && !loadIssues.includes(STORAGE_KEYS.clients)) {
        clients.push(
          ...["Mazer", "Manuchar", "Demandas internas"].map(
            (name) => normalizeClient({ id: uniqueId(), name })
          )
        );
        ctx2.persist(STORAGE_KEYS.clients, clients);
      }
    } catch {
    }
    return { render, reset, clientLabel, demandLabel, openClient };
  }

  // src/js/app.js
  var views = {
    home: "Hoje",
    tasks: "Tarefas",
    work: "Trabalho",
    agenda: "Agenda",
    calendar: "Calend\xE1rio"
  };
  var state = {
    tasks: loadRecords(STORAGE_KEYS.tasks, normalizeTask),
    meetings: loadRecords(STORAGE_KEYS.meetings, normalizeMeeting),
    celebrations: loadRecords(STORAGE_KEYS.celebrations, normalizeCelebration),
    clients: loadRecords(STORAGE_KEYS.clients, normalizeClient),
    demands: loadRecords(STORAGE_KEYS.demands, normalizeDemand)
  };
  var ctx = { state, notify, navigate, refresh, persist, renderDashboard, clearStorageProblems };
  var themePreference = "system";
  var booted = false;
  function navigate(view, { focus = true } = {}) {
    if (!Object.hasOwn(views, view)) return;
    $$("[data-view-panel]").forEach((panel) => panel.hidden = panel.dataset.viewPanel !== view);
    $$(".sidebar-link").forEach((button) => {
      const active = button.dataset.viewTarget === view;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    document.title = `${views[view]} | ${BRAND.name}`;
    if (focus) $(`#${view}-heading`).focus({ preventScroll: true });
  }
  function persist(key, list) {
    const saved = saveRecords(key, list);
    if (!saved) {
      $("#storage-warning").hidden = false;
      $("#storage-warning-text").textContent = "N\xE3o foi poss\xEDvel salvar. As altera\xE7\xF5es est\xE3o apenas nesta p\xE1gina. Exporte um backup antes de sair.";
    }
    return saved;
  }
  function clearStorageProblems() {
    clearLoadIssues();
    $("#storage-warning").hidden = true;
  }
  function applyTheme() {
    const dark = themePreference === "dark" || themePreference === "system" && matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.bsTheme = dark ? "dark" : "light";
    const labels = { system: "Sistema", light: "Claro", dark: "Escuro" };
    $("#theme-symbol").textContent = themePreference === "system" ? "\u25D0" : dark ? "\u2600" : "\u263E";
    $("#theme-toggle").setAttribute("aria-label", `Tema: ${labels[themePreference]}. Alternar tema`);
    $("#theme-toggle").title = `Tema: ${labels[themePreference]}`;
    $("#theme-toggle").setAttribute("aria-pressed", String(dark));
  }
  function renderDashboard() {
    const tasks = state.tasks, completed = tasks.filter((t) => t.completed).length;
    const counts = {
      total: tasks.length,
      pending: tasks.length - completed,
      completed,
      overdue: tasks.filter((t) => isOverdue(t)).length,
      meetings: state.meetings.filter((m) => m.date === todayKey()).length
    };
    for (const [name, value] of Object.entries(counts)) $(`#summary-${name}`).textContent = value;
    const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    $("#progress-label").textContent = `${progress}% conclu\xEDdo`;
    $("#progress-bar").style.width = `${progress}%`;
    $("#progress-track").setAttribute("aria-valuenow", progress);
    $("#home-status").textContent = tasks.length ? `${counts.pending} pendente(s) \xB7 ${counts.overdue} vencida(s) \xB7 ${tasks.filter((t) => t.status === "waiting").length} aguardando retorno.` : "Comece adicionando o pr\xF3ximo passo do seu dia.";
    const events = ctx.events.eventsForDate(todayKey());
    replacePreservingState(
      $("#home-today"),
      events.length ? events.map(ctx.events.eventRow) : [renderEmpty("Nenhum evento para hoje.")]
    );
    const focus = tasks.filter(
      (t) => !t.completed && (isOverdue(t) || t.status === "waiting" || t.dueDate === todayKey() || t.followUpDate && t.followUpDate <= todayKey())
    ).slice(0, 8);
    replacePreservingState(
      $("#home-focus"),
      focus.length ? focus.map(ctx.tasks.row) : [renderEmpty("Nenhuma tarefa vencida, para hoje ou aguardando retorno.")]
    );
  }
  function refresh() {
    if (!booted) return;
    ctx.tasks.render();
    ctx.agenda.renderAgenda();
    ctx.agenda.renderCelebrations();
    renderDashboard();
    ctx.events.render();
    ctx.work.render();
  }
  try {
    $("#brand-name").textContent = BRAND.name;
    $("#brand-tagline").textContent = BRAND.tagline;
    $$("[data-view-target]").forEach(
      (button) => button.addEventListener("click", () => navigate(button.dataset.viewTarget))
    );
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      themePreference = ["dark", "light"].includes(saved) ? saved : "system";
    } catch {
    }
    applyTheme();
    $("#theme-toggle").addEventListener("click", () => {
      themePreference = { system: "light", light: "dark", dark: "system" }[themePreference];
      applyTheme();
      try {
        localStorage.setItem(STORAGE_KEYS.theme, themePreference);
      } catch {
        notify("N\xE3o foi poss\xEDvel salvar a prefer\xEAncia de tema.", "error");
      }
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
    $("#agenda-date").value = todayKey();
    ctx.work = initWork(ctx);
    ctx.tasks = initTasks(ctx);
    ctx.agenda = initAgenda(ctx);
    ctx.events = initEvents(ctx);
    initBackup(ctx);
    ctx.agenda.resetMeetingForm();
    booted = true;
    refresh();
    ctx.events.start();
    navigate("home", { focus: false });
    if (loadIssues.length) {
      $("#storage-warning").hidden = false;
      $("#storage-warning-text").textContent = "H\xE1 dados locais inv\xE1lidos ou indispon\xEDveis. Os originais foram preservados; exporte um backup para recupera\xE7\xE3o antes de restaurar outro arquivo.";
    }
    setInterval(() => {
      ctx.tasks.render();
      renderDashboard();
      ctx.events.render();
      ctx.work.render();
    }, 6e4);
    document.documentElement.dataset.appReady = "true";
  } catch (error) {
    console.error("Ordavik: falha de inicializa\xE7\xE3o.", error);
    const warning = $("#startup-warning");
    warning.hidden = false;
    warning.textContent = "N\xE3o foi poss\xEDvel iniciar a aplica\xE7\xE3o. Recarregue a p\xE1gina. Se voc\xEA editou src/js, execute npm run build. Os dados salvos n\xE3o foram apagados.";
  }
})();
