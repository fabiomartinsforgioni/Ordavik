/**
 * Ordavik | Dados, validações e calendário brasileiro
 * --------------------------------------------------
 * Funções deste módulo não manipulam elementos HTML. Isso permite testá-las
 * separadamente da interface e reaproveitá-las nas telas de tarefas e agenda.
 */

export const STORAGE_KEYS = Object.freeze({
  tasks: "taskflow-tasks", // Chave das sprints antigas: NÃO alterar.
  meetings: "taskflow-meetings",
  celebrations: "taskflow-celebrations",
  clients: "ordavik-clients",
  demands: "ordavik-demands",
  theme: "taskflow-theme",
});
export const loadIssues = [];
const blockedKeys = new Set();
export function clearLoadIssues() {
  loadIssues.splice(0);
  blockedKeys.clear();
}

export const PRIORITIES = Object.freeze({ low: "Baixa", medium: "Média", high: "Alta" });
export const CATEGORIES = Object.freeze({
  work: "Trabalho",
  personal: "Pessoal",
  studies: "Estudos",
  other: "Outros",
});
export const KINDS = Object.freeze({ birthday: "Aniversário", special: "Data especial" });
export const STATUSES = Object.freeze({
  pending: "Pendente",
  progress: "Em andamento",
  waiting: "Aguardando retorno",
  completed: "Concluída",
});
export const RECURRENCES = Object.freeze({
  none: "Não repetir",
  daily: "Diariamente",
  weekly: "Semanalmente",
  monthly: "Mensalmente",
});

/** Lê strings opcionais com limite de tamanho, evitando dados antigos inválidos. */
export function safeText(value, max = 140) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function allowed(value, choices, fallback) {
  return Object.hasOwn(choices, value) ? value : fallback;
}

/** Datas são gravadas em horário LOCAL como YYYY-MM-DD, nunca como UTC. */
export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return false;
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function localKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
export function todayKey() {
  return localKey(new Date());
}
export function parseLocal(key) {
  if (!validDate(key)) return null;
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
export function plusDays(key, amount) {
  const date = parseLocal(key);
  if (!date) return "";
  date.setDate(date.getDate() + amount);
  return localKey(date);
}
const brDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
export function formatDate(key) {
  return parseLocal(key) ? brDate.format(parseLocal(key)) : "Sem data";
}
export function formatDay(key) {
  const date = parseLocal(key);
  return date
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(date)
    : "Data inválida";
}

export function uniqueId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return `tf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseTags(raw) {
  const parts = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  return [...new Set(parts.map((value) => safeText(value, 25)).filter(Boolean))].slice(0, 8);
}

/**
 * Normalização é uma migração NÃO DESTRUTIVA.
 * A propriedade legada `description` continua sendo o título da tarefa;
 * `details` contém a nova descrição longa.
 */
export function normalizeTask(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const id = safeText(raw.id, 100);
  const description = safeText(raw.description || raw.title, 140);
  if (!id || !description || typeof raw.completed !== "boolean") return null;
  const startDate = validDate(raw.startDate) ? raw.startDate : "";
  const dueDate = validDate(raw.dueDate) ? raw.dueDate : "";
  const status = raw.completed ? "completed" : allowed(raw.status, STATUSES, "pending");
  const minutes = (value) =>
    Number.isFinite(Number(value)) ? Math.min(100000, Math.max(0, Math.round(Number(value)))) : 0;
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
    subtasks: (Array.isArray(raw.subtasks) ? raw.subtasks : [])
      .filter((s) => s && typeof s.text === "string" && s.text.trim())
      .slice(0, 50)
      .map((s) => ({
        id: safeText(s.id, 100) || uniqueId(),
        text: safeText(s.text, 180),
        completed: s.completed === true,
      })),
    history: (Array.isArray(raw.history) ? raw.history : [])
      .filter(
        (h) =>
          h &&
          typeof h.at === "string" &&
          !Number.isNaN(Date.parse(h.at)) &&
          typeof h.text === "string",
      )
      .slice(-100)
      .map((h) => ({ at: h.at, text: safeText(h.text, 500) })),
    details: safeText(raw.details, 1000),
    category: allowed(raw.category, CATEGORIES, "other"),
    project: safeText(raw.project, 80),
    priority: allowed(raw.priority, PRIORITIES, "medium"),
    tags: parseTags(raw.tags),
    startDate,
    dueDate,
    dueTime: dueDate && validTime(raw.dueTime) ? raw.dueTime : "",
  };
}

export function normalizeMeeting(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const id = safeText(raw.id, 100);
  const title = safeText(raw.title, 140);
  if (
    !id ||
    !title ||
    !validDate(raw.date) ||
    !validTime(raw.startTime) ||
    !validTime(raw.endTime) ||
    raw.endTime <= raw.startTime
  )
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
    details: safeText(raw.details, 1000),
    location: safeText(raw.location, 300),
  };
}

export function normalizeCelebration(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const id = safeText(raw.id, 100),
    name = safeText(raw.name, 140);
  if (!id || !name || !validDate(raw.date)) return null;
  return {
    id,
    name,
    date: raw.date,
    kind: allowed(raw.kind, KINDS, "birthday"),
    notes: safeText(raw.notes, 250),
  };
}

/** Recupera uma coleção; registros antigos incompletos recebem valores padrão. */
export function loadRecords(storageKey, normalizer) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return [];
    const records = JSON.parse(raw);
    if (!Array.isArray(records)) throw new Error("A coleção não é uma lista.");
    const seen = new Set();
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
    console.warn(`Ordavik: dados indisponíveis em ${storageKey}.`, error);
    blockedKeys.add(storageKey);
    loadIssues.push(storageKey);
    return [];
  }
}

/** O array fornecido substitui a coleção local somente após uma alteração. */
export function saveRecords(storageKey, records) {
  if (blockedKeys.has(storageKey)) return false;
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
    return true;
  } catch (error) {
    console.warn(`Ordavik: falha ao salvar ${storageKey}.`, error);
    return false;
  }
}

/** Tarefa sem horário vence ao fim do dia, nunca à meia-noite do início. */
export function isOverdue(task, now = new Date()) {
  if (task.completed || !validDate(task.dueDate)) return false;
  const deadline = `${task.dueDate}T${validTime(task.dueTime) ? task.dueTime : "23:59"}`;
  const current = `${localKey(now)}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return deadline < current;
}

export function isDueSoon(task, now = new Date()) {
  if (task.completed || !validDate(task.dueDate) || isOverdue(task, now)) return false;
  // Uma tarefa é próxima quando vence hoje, amanhã ou depois de amanhã.
  return task.dueDate <= plusDays(localKey(now), 2);
}

/** Reaparece todo ano. Em ano não bissexto, 29/02 é exibido em 28/02. */
export function yearlyDate(celebration, year) {
  const monthDay = celebration.date.slice(5);
  const leapFallback = monthDay === "02-29" && !validDate(`${year}-02-29`);
  return `${year}-${leapFallback ? "02-28" : monthDay}`;
}

/** Algoritmo gregoriano para determinar a Páscoa, base para Sexta-feira Santa. */
function easter(year) {
  const a = year % 19,
    b = Math.floor(year / 100),
    c = year % 100;
  const d = Math.floor(b / 4),
    e = b % 4;
  const f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4),
    k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k + 7 * 700) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const x = h + l - 7 * m + 114;
  return `${year}-${String(Math.floor(x / 31)).padStart(2, "0")}-${String((x % 31) + 1).padStart(2, "0")}`;
}

/**
 * Lista de feriados NACIONAIS brasileiros, sem confundir pontos facultativos
 * (Carnaval, Corpus Christi) com feriados. Não inclui feriados estaduais/municipais.
 */
export function fallbackHolidays(year) {
  const fixed = [
    ["01-01", "Confraternização Universal"],
    ["04-21", "Tiradentes"],
    ["05-01", "Dia do Trabalho"],
    ["09-07", "Independência do Brasil"],
    ["10-12", "Nossa Senhora Aparecida"],
    ["11-02", "Finados"],
    ["11-15", "Proclamação da República"],
    ["12-25", "Natal"],
  ];
  if (year >= 2024) fixed.push(["11-20", "Dia Nacional de Zumbi e da Consciência Negra"]);
  const holidays = fixed.map(([day, name]) => ({ date: `${year}-${day}`, name, type: "holiday" }));
  holidays.push({ date: plusDays(easter(year), -2), name: "Paixão de Cristo", type: "holiday" });
  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}

const holidayCache = new Map();
/**
 * Consulta BrasilAPI e filtra os resultados pelos feriados nacionais oficiais.
 * Usa cálculo local quando a internet/API não funciona. Cache em memória por ano.
 */
export function getNationalHolidays(year) {
  if (holidayCache.has(year)) return holidayCache.get(year);
  const fallback = fallbackHolidays(year);
  const promise = (async () => {
    if (typeof fetch !== "function") return { holidays: fallback, source: "local" };
    try {
      const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const records = await response.json();
      if (!Array.isArray(records)) throw new Error("Resposta inesperada");
      const namesByDate = new Map(
        records
          .filter((r) => validDate(r.date) && typeof r.name === "string")
          .map((r) => [r.date, safeText(r.name, 100)]),
      );
      // Só os dias oficiais da lista local são mantidos. Evita pontos facultativos da API.
      return {
        holidays: fallback.map((h) => ({ ...h, name: namesByDate.get(h.date) || h.name })),
        source: "BrasilAPI",
      };
    } catch (error) {
      console.info("Ordavik: usando feriados nacionais locais.", error.message);
      return { holidays: fallback, source: "local" };
    }
  })();
  holidayCache.set(year, promise);
  return promise;
}
