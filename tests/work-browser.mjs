import { chromium } from "playwright";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile, mkdir } from "node:fs/promises";

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: "4176" },
  stdio: ["ignore", "pipe", "pipe"],
});
await once(server.stdout, "data");
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://brasilapi.com.br/**", (route) => route.abort());
  await page.goto("http://127.0.0.1:4176");
  assert.equal(await page.locator("html").getAttribute("data-app-ready"), "true");
  const click = async (name) => page.getByRole("button", { name, exact: true }).click();
  const fill = async (id, value) => page.locator("#" + id).fill(value);
  const records = (name) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), name);
  const client = async (name) =>
    page.locator("#work-clients").getByRole("button", { name, exact: true }).click();
  await click("Trabalho");
  await client("Mazer");
  const mazer = (await records("ordavik-clients")).find((c) => c.name === "Mazer");
  await click("Nova demanda");
  assert.equal(await page.locator("#work-demand-form-notes").getAttribute("maxlength"), "2000");
  await fill("work-demand-form-title", "Revisar integração");
  await fill("work-demand-form-ticket", "CH-123");
  await fill("work-demand-form-objective", "Corrigir o envio");
  await fill("work-demand-form-acceptance", "Cenário validado");
  await click("Salvar demanda");
  const demand = (await records("ordavik-demands"))[0];
  assert.equal(demand.clientId, mazer.id);
  await page
    .locator("#work-demands")
    .getByRole("button", { name: "Adicionar tarefa", exact: true })
    .click();
  assert.equal(await page.locator("#task-client").inputValue(), mazer.id);
  assert.equal(await page.locator("#task-demand").inputValue(), demand.id);
  await fill("task-input", "Solicitar evidências");
  await fill("task-waiting-for", "Responsável do cliente");
  await fill("task-follow-up", "2026-10-23");
  await page.locator("#task-status").selectOption("waiting");
  await click("Adicionar tarefa");
  const task = (await records("taskflow-tasks"))[0];
  assert.equal(task.clientId, mazer.id);
  assert.equal(task.demandId, demand.id);
  await click("Trabalho");
  await client("Manuchar");
  await click("Tarefas");
  assert.equal(await page.locator("#work-tasks .task-item").count(), 0);
  await click("Nova tarefa de trabalho");
  await fill("task-input", "Enviar relatório");
  await click("Adicionar tarefa");
  assert.equal((await records("taskflow-tasks"))[1].demandId, "");
  await click("Trabalho");
  await client("Mazer");
  await click("Tarefas");
  assert.equal(await page.locator("#work-tasks .task-item").count(), 1);
  await page
    .locator("#work-tasks")
    .getByRole("combobox", { name: "Andamento da tarefa: Solicitar evidências", exact: true })
    .selectOption("progress");
  assert.equal((await records("taskflow-tasks"))[0].status, "progress");
  await click("Anotações");
  await fill("work-notes", "Contexto geral do cliente");
  await click("Salvar anotações");
  await click("Editar cliente");
  await fill("work-client-form-name", "Mazer atualizado");
  await fill("work-client-form-notes", "Anotações atualizadas no cadastro");
  await click("Salvar cliente");
  assert.equal(await page.locator("#work-notes").inputValue(), "Anotações atualizadas no cadastro");
  assert.equal((await records("taskflow-tasks"))[0].clientId, mazer.id);
  await click("Arquivar cliente");
  await click("Tarefas");
  await page
    .locator("#work-tasks")
    .getByRole("button", { name: "Editar tarefa: Solicitar evidências", exact: true })
    .click();
  assert.equal(await page.locator("#task-client").inputValue(), mazer.id);
  assert.equal(await page.locator("#task-demand").inputValue(), demand.id);
  await click("Salvar alterações");
  assert.equal((await records("taskflow-tasks"))[0].clientId, mazer.id);
  await click("Trabalho");
  await click("Reativar cliente");
  await click("Agenda");
  await fill("meeting-title", "Reunião Mazer");
  await fill("meeting-date", "2026-10-23");
  await fill("meeting-start", "09:00");
  await fill("meeting-end", "10:00");
  await page.locator("#meeting-client").selectOption(mazer.id);
  await click("Adicionar compromisso");
  await click("Trabalho");
  await click("Arquivar cliente");
  await click("Agenda");
  await page
    .locator("#agenda-content")
    .getByRole("button", { name: "Editar compromisso: Reunião Mazer", exact: true })
    .click();
  assert.equal(await page.locator("#meeting-client").inputValue(), mazer.id);
  await click("Salvar alterações");
  assert.equal((await records("taskflow-meetings"))[0].clientId, mazer.id);
  await click("Trabalho");
  await click("Reativar cliente");
  await click("Agenda do cliente");
  assert.equal(
    await page.locator("#work-agenda").getByText("Reunião Mazer", { exact: true }).count(),
    1,
  );
  const downloading = page.waitForEvent("download");
  await click("Backup");
  const download = await downloading;
  const backup = JSON.parse(await readFile(await download.path(), "utf8"));
  assert.equal(backup.version, 2);
  assert.equal(backup.clients.length, 3);
  assert.equal(backup.demands.length, 1);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#backup-file").setInputFiles({
    name: "work.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByText("Backup restaurado com sucesso.", { exact: true }).waitFor();
  await page.reload();
  await click("Trabalho");
  await client("Mazer atualizado");
  await click("Anotações");
  assert.equal(await page.locator("#work-notes").inputValue(), "Anotações atualizadas no cadastro");
  await click("Demandas");
  await mkdir("output/playwright", { recursive: true });
  await page.screenshot({ path: "output/playwright/work-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: "output/playwright/work-mobile.png", fullPage: true });
  const invalid = { ...backup, clients: [] };
  await page.locator("#backup-file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(invalid)),
  });
  await page.getByText(/Falha na restauração/).waitFor();
  assert.equal((await records("ordavik-clients")).length, 3);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#backup-file").setInputFiles({
    name: "legacy.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        app: "TaskFlow",
        version: 1,
        tasks: [{ id: "old", description: "Legado", completed: false }],
        meetings: [],
        celebrations: [],
      }),
    ),
  });
  await page.getByText("Backup restaurado com sucesso.", { exact: true }).waitFor();
  assert.deepEqual(await records("ordavik-clients"), []);
  assert.equal((await records("taskflow-tasks"))[0].description, "Legado");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: clientes, demandas, tarefas contextuais e avulsas, acompanhamento, andamento, renomeação, arquivamento, agenda, notas, backup v2/v1, recarga e celular.",
  );
} finally {
  await browser.close();
  server.kill();
}
