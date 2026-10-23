import { chromium } from "playwright";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { once } from "node:events";

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: "4174" },
  stdio: ["ignore", "pipe", "pipe"],
});
await once(server.stdout, "data");
const browser = await chromium.launch({ channel: "chrome", headless: true });
let context;
const errors = [];
try {
  context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  await page.clock.install();
  await page.route("https://brasilapi.com.br/**", (route) => route.abort());
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4174");
  assert.equal(await page.locator("html").getAttribute("data-app-ready"), "true");
  const click = async (name) => page.getByRole("button", { name, exact: true }).click();
  const fill = async (id, value) => page.locator("#" + id).fill(value);
  const select = async (id, value) => page.locator("#" + id).selectOption(value);
  const localTasks = () => page.evaluate(() => JSON.parse(localStorage.getItem("taskflow-tasks")));

  // Compatibilidade com tarefas que existiam antes dos campos avançados.
  await page.evaluate(() =>
    localStorage.setItem(
      "taskflow-tasks",
      JSON.stringify([
        {
          id: "legacy",
          description: "Tarefa antiga preservada",
          completed: false,
          priority: "high",
        },
      ]),
    ),
  );
  await page.reload();
  await click("Minhas tarefas");
  assert.equal(await page.locator("#task-template option").count(), 12);
  await select("task-template", "reminder");
  assert.equal(await page.locator("#task-input").inputValue(), "");
  assert.equal(await page.locator("#task-subtasks").inputValue(), "");
  assert.equal(await page.locator("#task-advanced").getAttribute("open"), null);
  await select("task-template", "simple");
  assert.equal(await page.locator("#task-subtasks").inputValue(), "");
  assert.equal(
    await page.locator("#task-list").getByText("Tarefa antiga preservada", { exact: true }).count(),
    1,
  );

  await fill("task-input", "Investigar integração");
  await page.locator("#task-advanced > summary").click();
  await select("task-status", "waiting");
  await select("task-priority", "high");
  await fill("task-project", "Cliente A");
  await fill("task-details", "Descrição detalhada preservada");
  await fill("task-next-action", "Conferir retorno");
  await fill("task-tags", "api, suporte");
  await fill("task-start-date", "2026-10-23");
  await fill("task-due-date", "2026-10-24");
  await fill("task-due-time", "14:30");
  await fill("task-subtasks", "Reproduzir\nValidar");
  await fill("task-estimated", "60");
  await fill("task-actual", "15");
  await fill("task-update", "Aguardando o log.");
  await click("Adicionar tarefa");
  let task = (await localTasks()).find((t) => t.description === "Investigar integração");
  assert.equal(task.project, "Cliente A");
  assert.equal(task.status, "waiting");
  assert.equal(task.subtasks.length, 2);
  assert.equal(task.estimatedMinutes, 60);
  assert.ok(task.history.some((entry) => entry.text === "Aguardando o log."));
  const inlineStatus = page
    .locator("#task-list")
    .getByRole("combobox", { name: "Andamento da tarefa: Investigar integração", exact: true });
  await inlineStatus.selectOption("progress");
  assert.equal((await localTasks()).find((t) => t.id === task.id).status, "progress");
  assert.equal(await page.locator("#task-form-heading").textContent(), "Nova tarefa");
  await inlineStatus.selectOption("completed");
  assert.equal((await localTasks()).find((t) => t.id === task.id).completed, true);
  assert.ok((await localTasks()).find((t) => t.id === task.id).completedAt);
  await inlineStatus.selectOption("waiting");
  assert.equal((await localTasks()).find((t) => t.id === task.id).completed, false);
  assert.equal((await localTasks()).find((t) => t.id === task.id).completedAt, null);
  await click("Aguardando retorno");
  assert.equal(await page.locator("#task-list > li").count(), 1);
  await fill("task-search", "inexistente");
  assert.equal(await page.locator("#task-list > li").count(), 0);
  await fill("task-search", "Cliente A");
  assert.equal(await page.locator("#task-list > li").count(), 1);
  await click("Editar tarefa: Investigar integração");
  await fill("task-input", "Investigar integração revisada");
  await click("Salvar alterações");
  assert.equal(
    (await localTasks()).find((t) => t.id === task.id).details,
    "Descrição detalhada preservada",
  );
  await click("Excluir tarefa: Investigar integração revisada");
  assert.equal(
    (await localTasks()).some((t) => t.id === task.id),
    false,
  );
  await click("Desfazer");
  assert.equal(
    (await localTasks()).some((t) => t.id === task.id),
    true,
  );
  const row = page.locator("#task-list > li").filter({ hasText: "Investigar integração revisada" });
  await row.locator("details.task-extra > summary").click();
  await row.getByLabel("Reproduzir", { exact: true }).check();
  assert.equal(
    await row.locator("details.task-extra").getAttribute("open"),
    "",
    "marcar uma etapa deve manter o checklist aberto",
  );
  assert.equal((await localTasks()).find((t) => t.id === task.id).subtasks[0].completed, true);
  await row.getByLabel("Validar", { exact: true }).focus();
  await page.clock.fastForward(60_000);
  assert.equal(await row.locator("details.task-extra").getAttribute("open"), "");
  assert.equal(
    await page.evaluate(() => document.activeElement.closest("label").textContent),
    "Validar",
  );

  // Recorrência não duplica a próxima ocorrência ao reabrir/concluir.
  await fill("task-input", "Revisão semanal");
  await page.locator("#task-advanced > summary").click();
  await fill("task-due-date", "2026-10-23");
  await select("task-recurrence", "weekly");
  await click("Adicionar tarefa");
  await page
    .locator("#task-list")
    .getByLabel("Concluir tarefa: Revisão semanal", { exact: true })
    .click();
  let recurring = (await localTasks()).filter((t) => t.description === "Revisão semanal");
  assert.equal(recurring.length, 2);
  const source = recurring.find((t) => t.completed);
  assert.equal(recurring.find((t) => !t.completed).dueDate, "2026-10-30");
  await page.locator(`#task-list [data-task-id="${source.id}"] .task-checkbox`).click();
  await page.locator(`#task-list [data-task-id="${source.id}"] .task-checkbox`).click();
  assert.equal((await localTasks()).filter((t) => t.description === "Revisão semanal").length, 2);

  await click("Agenda");
  await fill("meeting-title", "Alinhamento");
  await fill("meeting-date", "2026-10-23");
  await fill("meeting-start", "09:00");
  await fill("meeting-end", "10:00");
  await fill("meeting-location", "https://example.com/reuniao");
  await click("Adicionar compromisso");
  assert.equal(
    await page.locator("#agenda-content").getByText("Alinhamento", { exact: true }).count(),
    1,
  );
  await click("Editar compromisso: Alinhamento");
  await fill("meeting-title", "Alinhamento revisado");
  await click("Salvar alterações");
  await fill("celebration-name", "Aniversário de teste");
  await fill("celebration-date", "2000-02-29");
  await click("Adicionar data");
  assert.equal(
    await page
      .locator("#celebration-content")
      .getByText("Aniversário de teste", { exact: true })
      .count(),
    1,
  );
  await click("Calendário");
  assert.equal(await page.locator(".calendar-day").count(), 42);
  const month = await page.locator("#calendar-month").textContent();
  await click("Próximo mês");
  assert.notEqual(await page.locator("#calendar-month").textContent(), month);
  await click("Mês anterior");
  await page.locator(".calendar-day").nth(15).click();
  await click("Novo compromisso nesta data");
  assert.equal(await page.locator("#view-agenda").isVisible(), true);
  assert.ok(await page.locator("#meeting-date").inputValue());

  const downloadPromise = page.waitForEvent("download");
  await click("Backup");
  const download = await downloadPromise;
  const backup = JSON.parse(await readFile(await download.path(), "utf8"));
  assert.equal(backup.app, "Ordavik");
  assert.equal(backup.meetings.length, 1);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#backup-file").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByText("Backup restaurado com sucesso.", { exact: true }).waitFor();
  await page.locator("#backup-file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"app":"Ordavik","version":1,"tasks":[{}]}'),
  });
  await page.getByText(/Falha na restauração/).waitFor();
  assert.equal((await localTasks()).length, backup.tasks.length);
  await page.locator("#theme-toggle").click();
  await page.locator("#theme-toggle").click();
  assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "dark");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("data-bs-theme"), "dark");
  await click("Minhas tarefas");
  await mkdir("output/playwright", { recursive: true });
  await page.screenshot({ path: "output/playwright/desktop-dark.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    "sem rolagem horizontal no celular",
  );
  await page.screenshot({ path: "output/playwright/mobile-dark.png", fullPage: true });
  await page.locator("#theme-toggle").click();
  await page.locator("#theme-toggle").click();
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.screenshot({ path: "output/playwright/desktop-light.png", fullPage: true });
  await select("task-template", "study");
  assert.equal(await page.locator("#task-input").inputValue(), "Sessão de estudos");
  assert.equal(
    await page.locator("#task-subtasks").inputValue(),
    "Revisar o conteúdo\nPraticar com um exercício\nRegistrar dúvidas",
  );
  await fill("task-due-time", "12:00");
  await click("Adicionar tarefa");
  assert.equal(
    (await localTasks()).some((t) => t.description === "Sessão de estudos"),
    false,
  );
  await fill("task-due-date", "2026-10-25");
  await click("Adicionar tarefa");
  assert.equal(
    (await localTasks()).some((t) => t.description === "Sessão de estudos"),
    true,
  );
  await click("Agenda");
  await click("Editar compromisso: Alinhamento revisado");
  await click("Cancelar edição");
  page.once("dialog", (dialog) => dialog.accept());
  await click("Excluir compromisso: Alinhamento revisado");
  assert.equal(
    await page
      .locator("#agenda-content")
      .getByText("Alinhamento revisado", { exact: true })
      .count(),
    0,
  );
  await click("Editar Aniversário de teste");
  await fill("celebration-name", "Data revisada");
  await click("Salvar alterações");
  page.once("dialog", (dialog) => dialog.accept());
  await click("Excluir Data revisada");
  assert.equal(
    await page.locator("#celebration-content").getByText("Data revisada", { exact: true }).count(),
    0,
  );

  // Erros de quota ficam visíveis mesmo depois da mensagem normal da ação.
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new Error("QuotaExceededError");
    };
  });
  await click("Minhas tarefas");
  await fill("task-input", "Temporária sem armazenamento");
  await click("Adicionar tarefa");
  assert.equal(await page.locator("#storage-warning").isVisible(), true);
  assert.equal(
    (await localTasks()).some((t) => t.description === "Temporária sem armazenamento"),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: dados legados, CRUD de tarefas, filtros, subtarefas, recorrência, agenda, calendário, backup, temas, recarga e celular.",
  );
} finally {
  await browser.close();
  server.kill();
}
