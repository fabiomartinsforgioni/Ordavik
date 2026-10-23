import {
  CATEGORIES,
  validDate,
  parseLocal,
  localKey,
  plusDays,
  todayKey,
  isOverdue,
  uniqueId,
  normalizeTask,
  STATUSES,
} from "./data.js";

/** Uma única regra para o seletor, o checkbox e a edição completa. */
export function setTaskStatus(task, status, at = new Date().toISOString()) {
  if (!Object.hasOwn(STATUSES, status) || task.status === status) return false;
  const previous = STATUSES[task.status] || STATUSES.pending;
  task.status = status;
  task.completed = status === "completed";
  task.completedAt = task.completed ? at : null;
  task.history = [
    ...(task.history || []),
    { at, text: `Andamento: ${previous} → ${STATUSES[status]}.` },
  ].slice(-100);
  return true;
}

/** Reconcilia linhas com etapas existentes, inclusive textos repetidos. */
export function mergeSubtasks(raw, original = []) {
  const available = [...original];
  return raw
    .split("\n")
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((text) => {
      const index = available.findIndex((item) => item.text === text);
      if (index >= 0) return { ...available.splice(index, 1)[0] };
      return { id: uniqueId(), text, completed: false };
    });
}

export function nextOccurrence(date, recurrence) {
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

export function makeNextTask(task) {
  const dueDate = nextOccurrence(task.dueDate, task.recurrence);
  if (!dueDate) return null;
  const offset =
    task.startDate && validDate(task.startDate)
      ? Math.round((parseLocal(dueDate) - parseLocal(task.dueDate)) / 86400000)
      : 0;
  return normalizeTask({
    ...task,
    id: uniqueId(),
    completed: false,
    status: "pending",
    dueDate,
    startDate: task.startDate ? plusDays(task.startDate, offset) : "",
    actualMinutes: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    recurrenceSourceId: task.id,
    recurrenceNextId: null,
    history: [{ at: new Date().toISOString(), text: "Ocorrência criada automaticamente." }],
    subtasks: (task.subtasks || []).map((s) => ({ ...s, id: uniqueId(), completed: false })),
  });
}

export function selectTasks(tasks, filters = {}) {
  const {
    query = "",
    category = "all",
    priority = "all",
    status = "all",
    period = "all",
    project = "",
    sort = "deadline",
    clients = [],
    demands = [],
  } = filters;
  const lower = (value) => String(value || "").toLocaleLowerCase("pt-BR");
  const today = todayKey();
  const rank = { high: 0, medium: 1, low: 2 };
  return tasks
    .filter((task) => {
      const clientName = clients.find((c) => c.id === task.clientId)?.name || "";
      const demandTitle = demands.find((d) => d.id === task.demandId)?.title || "";
      if ((status === "pending" && task.completed) || (status === "completed" && !task.completed))
        return false;
      if (["progress", "waiting"].includes(status) && task.status !== status) return false;
      if (
        (category !== "all" && task.category !== category) ||
        (priority !== "all" && task.priority !== priority)
      )
        return false;
      if (
        (period === "none" && task.dueDate) ||
        (period === "overdue" && !isOverdue(task)) ||
        (period === "today" && task.dueDate !== today)
      )
        return false;
      if (
        period === "week" &&
        (!task.dueDate || task.dueDate < today || task.dueDate > plusDays(today, 6))
      )
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
          ...(task.tags || []),
        ].join(" "),
      ).includes(lower(query).trim());
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      if (sort === "priority") return (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1);
      if (sort === "title") return a.description.localeCompare(b.description, "pt-BR");
      if (sort === "newest") return (b.createdAt || "").localeCompare(a.createdAt || "");
      return `${a.dueDate || "9999-12-31"}T${a.dueTime || "23:59"}`.localeCompare(
        `${b.dueDate || "9999-12-31"}T${b.dueTime || "23:59"}`,
      );
    });
}

export const TEMPLATES = {
  simple: {
    label: "Tarefa simples",
    description: "",
    placeholder: "O que você precisa fazer?",
    category: "other",
    subtasks: [],
  },
  reminder: {
    label: "Lembrete",
    description: "",
    placeholder: "Ex.: ligar para alguém ou renovar um documento",
    category: "personal",
    subtasks: [],
  },
  personal: {
    label: "Atividade pessoal",
    description: "",
    placeholder: "Ex.: organizar os documentos da casa",
    category: "personal",
    subtasks: [],
  },
  shopping: {
    label: "Compras e pendências",
    description: "Organizar compras",
    category: "personal",
    subtasks: ["Listar o que falta", "Conferir valores", "Realizar a compra"],
  },
  administrative: {
    label: "Rotina administrativa",
    description: "Resolver pendência administrativa",
    category: "work",
    subtasks: ["Reunir informações", "Executar a atividade", "Conferir o resultado"],
  },
  followup: {
    label: "Acompanhar retorno",
    description: "Acompanhar solicitação",
    category: "work",
    subtasks: ["Consultar o andamento", "Registrar o retorno", "Definir o próximo passo"],
  },
  bugfix: {
    label: "Correção de problema",
    description: "Corrigir problema",
    category: "work",
    subtasks: ["Reproduzir o erro", "Corrigir a causa", "Testar o resultado"],
  },
  reading: {
    label: "Leitura ou curso",
    description: "Avançar na leitura ou no curso",
    category: "studies",
    subtasks: ["Selecionar o conteúdo", "Estudar", "Anotar os principais pontos"],
  },
  investigation: {
    label: "Investigação de demanda",
    description: "Investigar demanda",
    category: "work",
    subtasks: [
      "Reproduzir o problema",
      "Reunir evidências",
      "Identificar a causa",
      "Validar a solução",
      "Documentar o resultado",
    ],
  },
  study: {
    label: "Sessão de estudos",
    description: "Sessão de estudos",
    category: "studies",
    subtasks: ["Revisar o conteúdo", "Praticar com um exercício", "Registrar dúvidas"],
  },
  delivery: {
    label: "Preparar entrega",
    description: "Preparar entrega",
    category: "work",
    subtasks: [
      "Revisar os requisitos",
      "Implementar",
      "Testar",
      "Preparar documentação",
      "Validar a entrega",
    ],
  },
};
