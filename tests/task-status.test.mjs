import test from "node:test";
import assert from "node:assert/strict";
import { setTaskStatus, TEMPLATES } from "../src/js/task-rules.js";
import { normalizeTask } from "../src/js/data.js";

test("alterar andamento sincroniza conclusão, data e histórico sem mudar o conteúdo", () => {
  const task = normalizeTask({ id: "a", description: "Ligar", completed: false });
  assert.equal(setTaskStatus(task, "progress", "2026-10-23T12:00:00Z"), true);
  assert.equal(task.completed, false);
  assert.equal(task.status, "progress");
  setTaskStatus(task, "completed", "2026-10-23T13:00:00Z");
  assert.equal(task.completed, true);
  assert.equal(task.completedAt, "2026-10-23T13:00:00Z");
  setTaskStatus(task, "waiting", "2026-10-23T14:00:00Z");
  assert.equal(task.completed, false);
  assert.equal(task.completedAt, null);
  assert.equal(task.history.length, 3);
  assert.equal(task.description, "Ligar");
  assert.equal(setTaskStatus(task, "waiting"), false);
  assert.equal(task.history.length, 3);
  assert.equal(setTaskStatus(task, "invalid"), false);
  assert.equal(task.status, "waiting");
});
test("há modelos simples sem etapas obrigatórias e opções para outras rotinas", () => {
  assert.ok(TEMPLATES.reminder);
  assert.deepEqual(TEMPLATES.reminder.subtasks, []);
  assert.ok(TEMPLATES.simple);
  assert.deepEqual(TEMPLATES.simple.subtasks, []);
  assert.ok(Object.keys(TEMPLATES).length >= 10);
  for (const template of Object.values(TEMPLATES)) assert.ok(template.label);
});
