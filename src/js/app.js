import {
  STORAGE_KEYS,
  loadRecords,
  saveRecords,
  normalizeTask,
  normalizeMeeting,
  normalizeCelebration,
  isOverdue,
  todayKey,
  loadIssues,
  clearLoadIssues,
} from "./data.js";
import { $, $$, notify, renderEmpty, replacePreservingState } from "./ui.js";
import { BRAND } from "./config.js";
import { initTasks } from "./tasks.js";
import { initAgenda } from "./agenda.js";
import { initEvents } from "./events.js";
import { initBackup } from "./backup.js";
import { initWork } from "./work.js";
import { normalizeClient, normalizeDemand } from "./work-rules.js";

const views = {
  home: "Hoje",
  tasks: "Tarefas",
  work: "Trabalho",
  agenda: "Agenda",
  calendar: "Calendário",
};
const state = {
  tasks: loadRecords(STORAGE_KEYS.tasks, normalizeTask),
  meetings: loadRecords(STORAGE_KEYS.meetings, normalizeMeeting),
  celebrations: loadRecords(STORAGE_KEYS.celebrations, normalizeCelebration),
  clients: loadRecords(STORAGE_KEYS.clients, normalizeClient),
  demands: loadRecords(STORAGE_KEYS.demands, normalizeDemand),
};
const ctx = { state, notify, navigate, refresh, persist, renderDashboard, clearStorageProblems };
let themePreference = "system";
let booted = false;
function navigate(view, { focus = true } = {}) {
  if (!Object.hasOwn(views, view)) return;
  $$("[data-view-panel]").forEach((panel) => (panel.hidden = panel.dataset.viewPanel !== view));
  $$(".sidebar-link").forEach((button) => {
    const active = button.dataset.viewTarget === view;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.title = `${views[view]} | ${BRAND.name}`;
  if (focus) $(`#${view}-heading`).focus({ preventScroll: true });
}
function persist(key, list) {
  const saved = saveRecords(key, list);
  if (!saved) {
    $("#storage-warning").hidden = false;
    $("#storage-warning-text").textContent =
      "Não foi possível salvar. As alterações estão apenas nesta página. Exporte um backup antes de sair.";
  }
  return saved;
}
function clearStorageProblems() {
  clearLoadIssues();
  $("#storage-warning").hidden = true;
}
function applyTheme() {
  const dark =
    themePreference === "dark" ||
    (themePreference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.bsTheme = dark ? "dark" : "light";
  const labels = { system: "Sistema", light: "Claro", dark: "Escuro" };
  $("#theme-symbol").textContent = themePreference === "system" ? "◐" : dark ? "☀" : "☾";
  $("#theme-toggle").setAttribute("aria-label", `Tema: ${labels[themePreference]}. Alternar tema`);
  $("#theme-toggle").title = `Tema: ${labels[themePreference]}`;
  $("#theme-toggle").setAttribute("aria-pressed", String(dark));
}
function renderDashboard() {
  const tasks = state.tasks,
    completed = tasks.filter((t) => t.completed).length;
  const counts = {
    total: tasks.length,
    pending: tasks.length - completed,
    completed,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    meetings: state.meetings.filter((m) => m.date === todayKey()).length,
  };
  for (const [name, value] of Object.entries(counts)) $(`#summary-${name}`).textContent = value;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  $("#progress-label").textContent = `${progress}% concluído`;
  $("#progress-bar").style.width = `${progress}%`;
  $("#progress-track").setAttribute("aria-valuenow", progress);
  $("#home-status").textContent = tasks.length
    ? `${counts.pending} pendente(s) · ${counts.overdue} vencida(s) · ${tasks.filter((t) => t.status === "waiting").length} aguardando retorno.`
    : "Comece adicionando o próximo passo do seu dia.";
  const events = ctx.events.eventsForDate(todayKey());
  replacePreservingState(
    $("#home-today"),
    events.length ? events.map(ctx.events.eventRow) : [renderEmpty("Nenhum evento para hoje.")],
  );
  const focus = tasks
    .filter(
      (t) =>
        !t.completed &&
        (isOverdue(t) ||
          t.status === "waiting" ||
          t.dueDate === todayKey() ||
          (t.followUpDate && t.followUpDate <= todayKey())),
    )
    .slice(0, 8);
  replacePreservingState(
    $("#home-focus"),
    focus.length
      ? focus.map(ctx.tasks.row)
      : [renderEmpty("Nenhuma tarefa vencida, para hoje ou aguardando retorno.")],
  );
}
function refresh() {
  if (!booted) return;
  ctx.tasks.render();
  ctx.agenda.renderAgenda();
  ctx.agenda.renderCelebrations();
  renderDashboard();
  ctx.events.render();
  ctx.work.render();
}

try {
  $("#brand-name").textContent = BRAND.name;
  $("#brand-tagline").textContent = BRAND.tagline;
  $$("[data-view-target]").forEach((button) =>
    button.addEventListener("click", () => navigate(button.dataset.viewTarget)),
  );
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    themePreference = ["dark", "light"].includes(saved) ? saved : "system";
  } catch {}
  applyTheme();
  $("#theme-toggle").addEventListener("click", () => {
    themePreference = { system: "light", light: "dark", dark: "system" }[themePreference];
    applyTheme();
    try {
      localStorage.setItem(STORAGE_KEYS.theme, themePreference);
    } catch {
      notify("Não foi possível salvar a preferência de tema.", "error");
    }
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  $("#agenda-date").value = todayKey();
  ctx.work = initWork(ctx);
  ctx.tasks = initTasks(ctx);
  ctx.agenda = initAgenda(ctx);
  ctx.events = initEvents(ctx);
  initBackup(ctx);
  ctx.agenda.resetMeetingForm();
  booted = true;
  refresh();
  ctx.events.start();
  navigate("home", { focus: false });
  if (loadIssues.length) {
    $("#storage-warning").hidden = false;
    $("#storage-warning-text").textContent =
      "Há dados locais inválidos ou indisponíveis. Os originais foram preservados; exporte um backup para recuperação antes de restaurar outro arquivo.";
  }
  setInterval(() => {
    ctx.tasks.render();
    renderDashboard();
    ctx.events.render();
    ctx.work.render();
  }, 60_000);
  document.documentElement.dataset.appReady = "true";
} catch (error) {
  console.error("Ordavik: falha de inicialização.", error);
  const warning = $("#startup-warning");
  warning.hidden = false;
  warning.textContent =
    "Não foi possível iniciar a aplicação. Recarregue a página. Se você editou src/js, execute npm run build. Os dados salvos não foram apagados.";
}
