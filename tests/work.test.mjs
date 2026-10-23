import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeClient,
  normalizeDemand,
  validateWorkLinks,
  workSummary,
} from "../src/js/work-rules.js";
import { normalizeTask } from "../src/js/data.js";
import { parseBackup } from "../src/js/backup.js";

test("cadastro de cliente normaliza nome e mantém arquivamento/favorito", () => {
  assert.equal(
    normalizeClient({ id: "c", name: " Mazer ", archived: true, favorite: true }).name,
    "Mazer",
  );
  assert.equal(normalizeClient({ id: "c", name: " " }), null);
});
test("demanda e tarefa usam vínculos coerentes e estáveis", () => {
  const clients = [normalizeClient({ id: "c", name: "Mazer" })];
  const demands = [normalizeDemand({ id: "d", clientId: "c", title: "Integração" })];
  const tasks = [
    normalizeTask({
      id: "t",
      description: "Conferir",
      completed: false,
      clientId: "c",
      demandId: "d",
      waitingFor: "Cliente",
      followUpDate: "2026-10-23",
    }),
  ];
  assert.equal(tasks[0].waitingFor, "Cliente");
  assert.equal(tasks[0].followUpDate, "2026-10-23");
  assert.doesNotThrow(() => validateWorkLinks({ clients, demands, tasks }));
  assert.throws(() =>
    validateWorkLinks({ clients, demands, tasks: [{ ...tasks[0], clientId: "outro" }] }),
  );
});
test("resumo distingue retorno para hoje de prazo da entrega", () => {
  const result = workSummary(
    [{ completed: false, status: "waiting", followUpDate: "2026-10-23", dueDate: "2026-12-01" }],
    "2026-10-23",
  );
  assert.equal(result.followUps, 1);
  assert.equal(result.pending, 1);
  assert.equal(result.overdue, 0);
});
test("backup novo inclui clientes e demandas; backup antigo recebe coleções vazias", () => {
  const old = parseBackup({
    app: "TaskFlow",
    version: 1,
    tasks: [],
    meetings: [],
    celebrations: [],
  });
  assert.deepEqual(old.clients, []);
  assert.deepEqual(old.demands, []);
  const current = parseBackup({
    app: "Ordavik",
    version: 2,
    tasks: [],
    meetings: [],
    celebrations: [],
    clients: [{ id: "c", name: "Mazer" }],
    demands: [{ id: "d", clientId: "c", title: "Demanda" }],
  });
  assert.equal(current.demands[0].clientId, "c");
  assert.throws(() => parseBackup({ ...current, app: "Ordavik", version: 2, clients: [] }));
});
