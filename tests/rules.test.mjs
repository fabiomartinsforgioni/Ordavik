import test from "node:test";
import assert from "node:assert/strict";
import { nextOccurrence, makeNextTask, selectTasks, mergeSubtasks } from "../src/js/task-rules.js";
import { parseBackup } from "../src/js/backup.js";

test("recorrência mensal limita o dia ao último dia do mês", () => {
  assert.equal(nextOccurrence("2026-01-31", "monthly"), "2026-02-28");
  assert.equal(nextOccurrence("2028-01-31", "monthly"), "2028-02-29");
});
test("inserção e reordenação preservam progresso; duplicatas consomem cada etapa uma vez", () => {
  const original = [
    { id: "a", text: "A", completed: true },
    { id: "b", text: "B", completed: true },
  ];
  const merged = mergeSubtasks("Nova\nB\nA\nA", original);
  assert.equal(merged[1].id, "b");
  assert.equal(merged[1].completed, true);
  assert.equal(merged[2].id, "a");
  assert.equal(merged[2].completed, true);
  assert.notEqual(merged[3].id, "a");
  assert.equal(merged[3].completed, false);
});
test("nova ocorrência mantém contexto e reinicia execução", () => {
  const next = makeNextTask({
    id: "a",
    description: "Revisar",
    completed: true,
    recurrence: "weekly",
    dueDate: "2026-10-23",
    subtasks: [{ id: "s", text: "Conferir", completed: true }],
  });
  assert.notEqual(next.id, "a");
  assert.equal(next.dueDate, "2026-10-30");
  assert.equal(next.completed, false);
  assert.equal(next.subtasks[0].completed, false);
});
test("filtros combinam projeto, situação e pesquisa; ordenação por prioridade", () => {
  const tasks = [
    {
      id: "a",
      description: "Analisar",
      project: "Cliente A",
      status: "waiting",
      priority: "low",
      tags: [],
    },
    {
      id: "b",
      description: "Analisar",
      project: "Cliente A",
      status: "waiting",
      priority: "high",
      tags: [],
    },
  ];
  assert.deepEqual(
    selectTasks(tasks, {
      query: "cliente a",
      status: "waiting",
      project: "cliente a",
      sort: "priority",
    }).map((t) => t.id),
    ["b", "a"],
  );
});
test("backup aceita marca antiga e rejeita registros inválidos sem descartar dados", () => {
  assert.equal(
    parseBackup({ app: "TaskFlow", version: 1, tasks: [], meetings: [], celebrations: [] }).tasks
      .length,
    0,
  );
  assert.throws(() =>
    parseBackup({ app: "Ordavik", version: 1, tasks: [{}], meetings: [], celebrations: [] }),
  );
});
