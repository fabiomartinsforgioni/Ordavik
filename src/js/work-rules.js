import {
  safeText,
  allowed,
  validDate,
  STATUSES,
  PRIORITIES,
  isOverdue,
  parseLocal,
} from "./data.js";

export const WORK_TYPES = Object.freeze({
  task: "Atividade",
  support: "Suporte",
  investigation: "Investigação",
  fix: "Correção",
  improvement: "Melhoria",
  meeting: "Reunião",
  documentation: "Documentação",
  routine: "Rotina",
});
export function normalizeClient(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const id = safeText(raw.id, 100),
    name = safeText(raw.name, 80);
  if (!id || !name) return null;
  return {
    ...raw,
    id,
    name,
    notes: safeText(raw.notes, 5000),
    favorite: raw.favorite === true,
    archived: raw.archived === true,
  };
}
export function normalizeDemand(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const id = safeText(raw.id, 100),
    clientId = safeText(raw.clientId, 100),
    title = safeText(raw.title, 140);
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
    followUpDate: validDate(raw.followUpDate) ? raw.followUpDate : "",
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
    "notes",
  ])
    result[name] = safeText(raw[name], 2000);
  return result;
}
export function validateWorkLinks({ clients = [], demands = [], tasks = [], meetings = [] }) {
  const clientIds = new Set(clients.map((c) => c.id)),
    byDemand = new Map(demands.map((d) => [d.id, d]));
  for (const demand of demands)
    if (!clientIds.has(demand.clientId))
      throw new Error("Demanda vinculada a cliente inexistente.");
  for (const item of [...tasks, ...meetings]) {
    if (item.clientId && !clientIds.has(item.clientId))
      throw new Error("Atividade vinculada a cliente inexistente.");
    if (
      item.demandId &&
      (!byDemand.has(item.demandId) || byDemand.get(item.demandId).clientId !== item.clientId)
    )
      throw new Error("A demanda e o cliente da tarefa não correspondem.");
  }
}
export function workSummary(tasks, day) {
  const now = day ? parseLocal(day) : new Date();
  const today =
    day ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return {
    total: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    waiting: tasks.filter((t) => !t.completed && t.status === "waiting").length,
    overdue: tasks.filter((t) => isOverdue(t, now)).length,
    followUps: tasks.filter((t) => !t.completed && t.followUpDate && t.followUpDate <= today)
      .length,
  };
}
