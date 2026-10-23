import {
  STORAGE_KEYS,
  normalizeTask,
  normalizeMeeting,
  normalizeCelebration,
  todayKey,
} from "./data.js";
import { $ } from "./ui.js";
import { BRAND } from "./config.js";
import { normalizeClient, normalizeDemand, validateWorkLinks } from "./work-rules.js";

export function parseBackup(payload) {
  if (
    !payload ||
    !["Ordavik", "TaskFlow"].includes(payload.app) ||
    ![1, 2].includes(payload.version)
  )
    throw new Error("Formato de backup não reconhecido.");
  const result = {};
  for (const [name, normalize] of Object.entries({
    tasks: normalizeTask,
    meetings: normalizeMeeting,
    celebrations: normalizeCelebration,
    clients: normalizeClient,
    demands: normalizeDemand,
  })) {
    const list =
      payload[name] ??
      (payload.version === 1 && ["clients", "demands"].includes(name) ? [] : undefined);
    if (!Array.isArray(list) || list.length > 5000)
      throw new Error("Coleção ausente ou limite excedido.");
    const ids = new Set();
    result[name] = list.map((raw) => {
      const item = normalize(raw);
      if (!item || ids.has(item.id))
        throw new Error("Backup contém registros inválidos ou IDs duplicados.");
      ids.add(item.id);
      return item;
    });
  }
  validateWorkLinks(result);
  return result;
}

/** Preserva os valores exatos anteriores e tenta rollback se alguma coleção falhar. */
export function restoreRecords(collections, storage = localStorage) {
  const snapshot = Object.fromEntries(
    Object.keys(collections).map((name) => [name, storage.getItem(STORAGE_KEYS[name])]),
  );
  try {
    for (const [name, list] of Object.entries(collections))
      storage.setItem(STORAGE_KEYS[name], JSON.stringify(list));
  } catch (error) {
    let rollbackFailed = false;
    for (const [name, value] of Object.entries(snapshot)) {
      try {
        if (value === null) storage.removeItem(STORAGE_KEYS[name]);
        else storage.setItem(STORAGE_KEYS[name], value);
      } catch {
        rollbackFailed = true;
      }
    }
    throw new Error(
      rollbackFailed
        ? "Restauração interrompida. A recuperação local foi parcial; preserve seu arquivo de backup."
        : "Restauração interrompida; os dados anteriores foram preservados.",
    );
  }
}

export function initBackup(ctx) {
  $("#export-backup").addEventListener("click", () => {
    const rawStorage = {};
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      try {
        rawStorage[name] = localStorage.getItem(key);
      } catch {
        rawStorage[name] = null;
      }
    }
    const contents = JSON.stringify(
      {
        app: BRAND.name,
        version: 2,
        exportedAt: new Date().toISOString(),
        ...ctx.state,
        rawStorage,
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([contents], { type: "application/json;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `ordavik-backup-${todayKey()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    ctx.notify(
      "Backup exportado. O arquivo inclui os dados originais disponíveis para recuperação.",
    );
  });
  $("#import-backup").addEventListener("click", () => $("#backup-file").click());
  $("#backup-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 5_000_000) throw new Error("O backup ultrapassa 5 MB.");
      const restored = parseBackup(JSON.parse(await file.text()));
      if (
        !confirm(
          "Restaurar substituirá tarefas, compromissos, datas especiais, clientes e demandas deste navegador. Backups antigos não possuem clientes nem demandas. Exporte um backup antes. Continuar?",
        )
      )
        return;
      restoreRecords(restored);
      for (const [name, list] of Object.entries(restored))
        ctx.state[name].splice(0, ctx.state[name].length, ...list);
      ctx.clearStorageProblems();
      ctx.tasks.reset();
      ctx.agenda.resetMeetingForm();
      ctx.agenda.resetCelebrationForm();
      ctx.work.reset();
      ctx.refresh();
      ctx.notify("Backup restaurado com sucesso.");
    } catch (error) {
      ctx.notify(`Falha na restauração: ${error.message}`, "error");
    }
  });
}
