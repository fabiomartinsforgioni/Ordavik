import test from "node:test";
import assert from "node:assert/strict";
import * as data from "../src/js/data.js";

test("tarefas antigas preservam identificação, conteúdo e conclusão", () => {
  const task = data.normalizeTask({ id: "legacy", description: "Estudar", completed: true });
  assert.equal(task.description, "Estudar");
  assert.equal(task.completed, true);
  assert.equal(task.priority, "medium");
});

test("datas locais e prazos respeitam fim do dia", () => {
  assert.equal(data.validDate("2026-02-29"), false);
  assert.equal(data.plusDays("2026-12-31", 1), "2027-01-01");
  assert.equal(
    data.isOverdue({ dueDate: "2026-10-23", completed: false }, new Date(2026, 9, 23, 22)),
    false,
  );
});

test("situação, checklist e estimativas recebem valores seguros", () => {
  const task = data.normalizeTask({
    id: "a",
    description: "Investigar",
    completed: false,
    status: "waiting",
    estimatedMinutes: -10,
  });
  assert.equal(task.status, "waiting");
  assert.deepEqual(task.subtasks, []);
  assert.equal(task.estimatedMinutes, 0);
});

test("conclusão é coerente com a situação de tarefas antigas", () => {
  assert.equal(
    data.normalizeTask({ id: "a", description: "Feito", completed: true }).status,
    "completed",
  );
});
