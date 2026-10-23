import test from "node:test";
import assert from "node:assert/strict";
import { restoreRecords } from "../src/js/backup.js";
import {
  loadRecords,
  saveRecords,
  clearLoadIssues,
  normalizeTask,
  STORAGE_KEYS,
} from "../src/js/data.js";

test("falha parcial de restauração recupera os valores anteriores exatos", () => {
  const values = new Map([
    [STORAGE_KEYS.tasks, "original exato"],
    [STORAGE_KEYS.meetings, "[]"],
  ]);
  let failed = false;
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => {
      if (key === STORAGE_KEYS.meetings && !failed) {
        failed = true;
        throw new Error("QuotaExceededError");
      }
      values.set(key, value);
    },
  };
  assert.throws(
    () => restoreRecords({ tasks: [], meetings: [], celebrations: [] }, storage),
    /preservados/,
  );
  assert.equal(values.get(STORAGE_KEYS.tasks), "original exato");
  assert.equal(values.has(STORAGE_KEYS.celebrations), false);
});

test("JSON inválido é preservado e não é sobrescrito por uma lista vazia", () => {
  clearLoadIssues();
  const values = new Map([[STORAGE_KEYS.tasks, "{json quebrado"]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.deepEqual(loadRecords(STORAGE_KEYS.tasks, normalizeTask), []);
  assert.equal(saveRecords(STORAGE_KEYS.tasks, []), false);
  assert.equal(values.get(STORAGE_KEYS.tasks), "{json quebrado");
  clearLoadIssues();
  delete globalThis.localStorage;
});

test("coleção com registro inválido preserva o original para recuperação", () => {
  clearLoadIssues();
  const original = JSON.stringify([{ id: "a", description: "Válida", completed: false }, {}]);
  let stored = original;
  globalThis.localStorage = { getItem: () => stored, setItem: (_key, value) => (stored = value) };
  assert.equal(loadRecords(STORAGE_KEYS.tasks, normalizeTask).length, 1);
  assert.equal(saveRecords(STORAGE_KEYS.tasks, []), false);
  assert.equal(stored, original);
  clearLoadIssues();
  delete globalThis.localStorage;
});
