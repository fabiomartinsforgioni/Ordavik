import {
  STORAGE_KEYS,
  PRIORITIES,
  CATEGORIES,
  STATUSES,
  RECURRENCES,
  uniqueId,
  normalizeTask,
  formatDate,
  isOverdue,
  todayKey,
} from "./data.js";
import { $, $$, element, actionButton, replacePreservingState } from "./ui.js";
import {
  selectTasks,
  makeNextTask,
  TEMPLATES,
  mergeSubtasks,
  setTaskStatus,
} from "./task-rules.js";
import { WORK_TYPES } from "./work-rules.js";

export function initTasks(ctx) {
  const { tasks } = ctx.state;
  const form = $("#task-form");
  const fields = Object.fromEntries(
    Object.entries({
      description: "input",
      details: "details",
      category: "category",
      priority: "priority",
      project: "project",
      clientId: "client",
      demandId: "demand",
      workType: "work-type",
      waitingFor: "waiting-for",
      followUpDate: "follow-up",
      tags: "tags",
      startDate: "start-date",
      dueDate: "due-date",
      dueTime: "due-time",
      status: "status",
      nextAction: "next-action",
      recurrence: "recurrence",
      estimatedMinutes: "estimated",
      actualMinutes: "actual",
      subtasks: "subtasks",
    }).map(([key, id]) => [key, $(`#task-${id}`)]),
  );
  let editingId = null,
    activeFilter = "all";
  const defaultPlaceholder = fields.description.placeholder;
  for (const [value, label] of Object.entries(WORK_TYPES)) {
    const option = element("option", "", label);
    option.value = value;
    fields.workType.append(option);
  }
  function syncWorkOptions(clientId = fields.clientId.value, demandId = fields.demandId.value) {
    const update = (select, records, placeholder, value) => {
      const first = element("option", "", placeholder);
      first.value = "";
      select.replaceChildren(
        first,
        ...records.map(([id, label]) => {
          const option = element("option", "", label);
          option.value = id;
          return option;
        }),
      );
      select.value = [...select.options].some((o) => o.value === value) ? value : "";
    };
    update(
      fields.clientId,
      ctx.state.clients
        .filter((c) => !c.archived || c.id === clientId)
        .map((c) => [c.id, c.name + (c.archived ? " (arquivado)" : "")]),
      "Sem cliente",
      clientId,
    );
    update(
      fields.demandId,
      ctx.state.demands
        .filter((d) => d.clientId === clientId && (!d.archived || d.id === demandId))
        .map((d) => [d.id, d.title + (d.archived ? " (arquivada)" : "")]),
      "Tarefa avulsa",
      demandId,
    );
  }
  fields.clientId.addEventListener("change", () => {
    fields.demandId.value = "";
    if (fields.clientId.value) fields.category.value = "work";
    syncWorkOptions();
  });
  function createFor(clientId = "", demandId = "") {
    reset();
    syncWorkOptions(clientId, demandId);
    fields.category.value = "work";
    $("#task-advanced").open = true;
    ctx.navigate("tasks");
    fields.description.focus();
  }
  for (const [key, template] of Object.entries(TEMPLATES)) {
    const option = element("option", "", template.label);
    option.value = key;
    $("#task-template").append(option);
  }
  const log = (task, text) => {
    task.history.push({ at: new Date().toISOString(), text });
    task.history = task.history.slice(-100);
  };
  const clearValidity = () => Object.values(fields).forEach((field) => field.setCustomValidity(""));
  form.addEventListener("input", clearValidity);
  form.addEventListener(
    "invalid",
    () => {
      $("#task-advanced").open = true;
    },
    true,
  );
  function reset() {
    form.reset();
    clearValidity();
    editingId = null;
    $("#task-form-heading").textContent = "Nova tarefa";
    $("#task-submit").textContent = "Adicionar tarefa";
    $("#task-cancel").hidden = true;
    $("#task-advanced").open = false;
    $("#task-template").value = "";
    fields.description.placeholder = defaultPlaceholder;
  }
  function edit(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    reset();
    editingId = id;
    syncWorkOptions(task.clientId, task.demandId);
    for (const [key, field] of Object.entries(fields)) {
      field.value =
        key === "tags"
          ? task.tags.join(", ")
          : key === "subtasks"
            ? task.subtasks.map((s) => s.text).join("\n")
            : (task[key] ?? "");
    }
    $("#task-form-heading").textContent = "Editar tarefa";
    $("#task-submit").textContent = "Salvar alterações";
    $("#task-cancel").hidden = false;
    $("#task-advanced").open = true;
    ctx.navigate("tasks");
    fields.description.focus();
    form.scrollIntoView({ block: "start" });
  }
  function complete(task, checked, status = checked ? "completed" : "pending") {
    if (!setTaskStatus(task, status)) return;
    if (editingId === task.id) fields.status.value = status;
    if (
      checked &&
      task.recurrence !== "none" &&
      !tasks.some((t) => t.recurrenceSourceId === task.id) &&
      !task.recurrenceNextId
    ) {
      const next = makeNextTask(task);
      if (next) {
        tasks.push(next);
        task.recurrenceNextId = next.id;
      }
    }
    ctx.persist(STORAGE_KEYS.tasks, tasks);
    ctx.refresh();
  }
  function remove(id) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index < 0) return;
    const [task] = tasks.splice(index, 1);
    if (editingId === id) reset();
    ctx.persist(STORAGE_KEYS.tasks, tasks);
    ctx.refresh();
    ctx.notify("Tarefa excluída.", "success", () => {
      if (!tasks.some((t) => t.id === id)) tasks.splice(Math.min(index, tasks.length), 0, task);
      ctx.persist(STORAGE_KEYS.tasks, tasks);
      ctx.refresh();
    });
  }
  $("#task-cancel").addEventListener("click", reset);
  form.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editingId) {
      e.preventDefault();
      reset();
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearValidity();
    const raw = Object.fromEntries(
      Object.entries(fields).map(([key, field]) => [key, field.value]),
    );
    if (!raw.description.trim()) {
      fields.description.setCustomValidity("Informe um título com texto.");
      fields.description.reportValidity();
      return;
    }
    if ((raw.dueTime && !raw.dueDate) || (raw.recurrence !== "none" && !raw.dueDate))
      fields.dueDate.setCustomValidity("Informe o prazo para usar horário ou recorrência.");
    if (raw.startDate && raw.dueDate && raw.startDate > raw.dueDate)
      fields.dueDate.setCustomValidity("O prazo deve ser igual ou posterior ao início.");
    if (!form.reportValidity()) return;
    const original = tasks.find((t) => t.id === editingId);
    if (
      (raw.clientId && !ctx.state.clients.some((c) => c.id === raw.clientId)) ||
      (raw.demandId &&
        !ctx.state.demands.some((d) => d.id === raw.demandId && d.clientId === raw.clientId))
    ) {
      ctx.notify("Selecione um cliente e uma demanda correspondentes.", "error");
      return;
    }
    if (raw.clientId) raw.category = "work";
    raw.subtasks = mergeSubtasks(raw.subtasks, original?.subtasks);
    const task = normalizeTask({
      ...original,
      ...raw,
      id: original?.id || uniqueId(),
      completed: raw.status === "completed",
      createdAt: original?.createdAt || new Date().toISOString(),
    });
    if (!task) {
      ctx.notify("Confira os dados da tarefa.", "error");
      return;
    }
    log(task, original ? "Dados da tarefa atualizados." : "Tarefa criada.");
    if ($("#task-update").value.trim()) log(task, $("#task-update").value.trim());
    const previousStatus = original?.status || "pending";
    const nextStatus = task.status;
    if (original) Object.assign(original, task);
    else tasks.push(task);
    if (previousStatus !== nextStatus) {
      const updated = original || task;
      updated.status = previousStatus;
      updated.completed = previousStatus === "completed";
      complete(updated, nextStatus === "completed", nextStatus);
    }
    ctx.persist(STORAGE_KEYS.tasks, tasks);
    reset();
    activeFilter = "all";
    ["search", "filter-project"].forEach((id) => ($(`#task-${id}`).value = ""));
    ["filter-category", "filter-priority", "filter-period"].forEach(
      (id) => ($(`#task-${id}`).value = "all"),
    );
    ctx.refresh();
    ctx.notify(original ? "Tarefa atualizada." : "Tarefa cadastrada.");
    fields.description.focus();
  });
  $("#task-template").addEventListener("change", (event) => {
    const template = TEMPLATES[event.target.value];
    if (!template) {
      fields.description.placeholder = defaultPlaceholder;
      return;
    }
    if (
      (fields.description.value.trim() ||
        fields.details.value.trim() ||
        fields.subtasks.value.trim()) &&
      !confirm("Aplicar modelo substituirá título, natureza e checklist do formulário. Continuar?")
    )
      return;
    fields.description.value = template.description;
    fields.description.placeholder = template.placeholder || defaultPlaceholder;
    fields.category.value = template.category;
    fields.subtasks.value = template.subtasks.join("\n");
    $("#task-advanced").open = template.subtasks.length > 0;
    fields.description.focus();
  });
  $$("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      render();
    }),
  );
  [
    "search",
    "filter-category",
    "filter-priority",
    "filter-period",
    "filter-project",
    "sort",
  ].forEach((id) => $(`#task-${id}`).addEventListener("input", render));

  function row(task) {
    const li = element("li", "task-item");
    li.dataset.taskId = task.id;
    li.classList.toggle("completed", task.completed);
    li.classList.toggle("is-overdue", isOverdue(task));
    const checkbox = element("input", "task-checkbox");
    checkbox.dataset.uiKey = `task:${task.id}:completion`;
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Concluir tarefa: ${task.description}`);
    checkbox.addEventListener("change", () => complete(task, checkbox.checked));
    const content = element("div", "task-content");
    content.append(element("strong", "task-text", task.description));
    const meta = element("div", "task-meta");
    const badge = (text, cls = "meta-pill") => element("span", cls, text);
    meta.append(badge(STATUSES[task.status]), badge(CATEGORIES[task.category]));
    if (task.project) meta.append(badge(task.project));
    if (task.clientId) meta.append(badge(ctx.work.clientLabel(task.clientId)));
    if (task.demandId) meta.append(badge(ctx.work.demandLabel(task.demandId)));
    if (task.category === "work" || task.clientId)
      meta.append(badge(WORK_TYPES[task.workType] || WORK_TYPES.task));
    if (task.waitingFor)
      content.append(element("p", "next-action", `Aguardando: ${task.waitingFor}`));
    if (task.followUpDate)
      meta.append(
        badge(
          `Acompanhar: ${formatDate(task.followUpDate)}`,
          `meta-pill ${!task.completed && task.followUpDate <= todayKey() ? "due-soon" : ""}`,
        ),
      );
    if (task.dueDate)
      meta.append(
        badge(
          `${isOverdue(task) ? "Vencida: " : ""}${formatDate(task.dueDate)}${task.dueTime ? " às " + task.dueTime : ""}`,
          `meta-pill ${isOverdue(task) ? "due-overdue" : ""}`,
        ),
      );
    if (task.recurrence !== "none") meta.append(badge(RECURRENCES[task.recurrence]));
    task.tags.forEach((tag) => meta.append(badge("#" + tag, "meta-pill tag-pill")));
    content.append(meta);
    if (task.nextAction)
      content.append(element("p", "next-action", `Próximo passo: ${task.nextAction}`));
    if (
      task.details ||
      task.subtasks.length ||
      task.history.length ||
      task.estimatedMinutes ||
      task.actualMinutes
    ) {
      const details = element("details", "task-extra");
      details.dataset.uiKey = `task:${task.id}:details`;
      details.append(
        element(
          "summary",
          "",
          `Detalhes${task.subtasks.length ? ` · ${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length} etapas` : ""}`,
        ),
      );
      details.querySelector("summary").dataset.uiKey = `task:${task.id}:summary`;
      if (task.details) details.append(element("p", "task-details-text", task.details));
      if (task.estimatedMinutes || task.actualMinutes)
        details.append(
          element(
            "p",
            "help-text",
            `Estimado: ${task.estimatedMinutes} min · Realizado: ${task.actualMinutes} min`,
          ),
        );
      for (const sub of task.subtasks) {
        const label = element("label", "subtask-row");
        const check = element("input");
        check.dataset.uiKey = `task:${task.id}:subtask:${sub.id}`;
        check.type = "checkbox";
        check.checked = sub.completed;
        check.addEventListener("change", () => {
          sub.completed = check.checked;
          log(task, `${sub.completed ? "Concluída" : "Reaberta"} etapa: ${sub.text}`);
          ctx.persist(STORAGE_KEYS.tasks, tasks);
          ctx.refresh();
        });
        label.append(check, element("span", "", sub.text));
        details.append(label);
      }
      if (task.history.length) {
        const history = element("details", "history");
        history.dataset.uiKey = `task:${task.id}:history`;
        history.append(element("summary", "", "Histórico"));
        history.querySelector("summary").dataset.uiKey = `task:${task.id}:history-summary`;
        for (const entry of [...task.history].reverse())
          history.append(
            element(
              "p",
              "help-text",
              `${new Date(entry.at).toLocaleString("pt-BR")} — ${entry.text}`,
            ),
          );
        details.append(history);
      }
      content.append(details);
    }
    const actions = element("div", "item-actions");
    const statusLabel = element("label", "task-status-control", "Andamento");
    const statusSelect = element("select", "form-select task-status-select");
    statusSelect.dataset.uiKey = `task:${task.id}:status`;
    statusSelect.setAttribute("aria-label", `Andamento da tarefa: ${task.description}`);
    for (const [value, label] of Object.entries(STATUSES)) {
      const option = element("option", "", label);
      option.value = value;
      statusSelect.append(option);
    }
    statusSelect.value = task.status;
    statusSelect.addEventListener("change", () => {
      const status = statusSelect.value;
      complete(task, status === "completed", status);
      ctx.notify(`Andamento alterado para ${STATUSES[status]}.`);
    });
    statusLabel.append(statusSelect);
    const priority = badge(PRIORITIES[task.priority], "task-priority-badge");
    priority.dataset.priority = task.priority;
    actions.append(
      statusLabel,
      priority,
      actionButton(
        `Editar tarefa: ${task.description}`,
        "pencil-square",
        () => edit(task.id),
        "secondary",
        `task:${task.id}:edit`,
      ),
      actionButton(
        `Excluir tarefa: ${task.description}`,
        "trash3",
        () => remove(task.id),
        "danger",
        `task:${task.id}:delete`,
      ),
    );
    li.append(checkbox, content, actions);
    return li;
  }
  function render() {
    syncWorkOptions();
    const visible = selectTasks(tasks, {
      query: $("#task-search").value,
      category: $("#task-filter-category").value,
      priority: $("#task-filter-priority").value,
      period: $("#task-filter-period").value,
      project: $("#task-filter-project").value,
      status: activeFilter,
      sort: $("#task-sort").value,
      clients: ctx.state.clients,
      demands: ctx.state.demands,
    });
    replacePreservingState($("#task-list"), visible.map(row));
    $("#task-total-badge").textContent = `${visible.length} / ${tasks.length}`;
    $("#empty-state").hidden = visible.length > 0;
    $("#empty-state-text").textContent = tasks.length
      ? "Nenhuma tarefa corresponde aos filtros."
      : "Nenhuma tarefa cadastrada. Comece pelo próximo passo.";
    $$("[data-filter]").forEach((button) => {
      const active = button.dataset.filter === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  return { render, edit, reset, row, createFor };
}
