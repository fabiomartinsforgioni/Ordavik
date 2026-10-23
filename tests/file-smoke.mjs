import { chromium } from "playwright";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.route(/^https?:\/\//, (route) => route.abort());
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve("index.html")).href);
  assert.equal(
    await page.locator("html").getAttribute("data-app-ready"),
    "true",
    "todos os componentes devem inicializar",
  );
  await page.getByRole("button", { name: "Minhas tarefas", exact: true }).click();
  assert.equal(
    await page.locator("#view-tasks").isVisible(),
    true,
    "botão deve funcionar ao abrir o HTML diretamente",
  );
  assert.deepEqual(errors, []);
  console.log("PASS: inicialização e navegação por file://");
} finally {
  await browser.close();
}
