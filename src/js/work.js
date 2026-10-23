import {
  STORAGE_KEYS,
  STATUSES,
  PRIORITIES,
  uniqueId,
  todayKey,
  formatDate,
  loadIssues,
  isOverdue,
} from "./data.js";
import { normalizeClient, normalizeDemand, workSummary } from "./work-rules.js";
import { $, $$, element, actionButton, renderEmpty, replacePreservingState } from "./ui.js";

/** Área Trabalho: os registros são os mesmos utilizados nas demais telas. */
export function initWork(ctx) {
  const { clients, demands, tasks, meetings } = ctx.state;
  let selectedClient = "",
    editingClient = "",
    editingDemand = "",
    tab = "summary";
  let notesSaved = "";
  function makeForm(id, definitions, submitLabel) {
    const form = $(id),
      fields = {};
    for (const [name, label, type = "text", choices] of definitions) {
      const wrapper = element("div", `form-field ${type === "textarea" ? "span-2" : ""}`),
        input = element(
          type === "textarea" ? "textarea" : type === "select" ? "select" : "input",
          "form-control",
        );
      input.id = `${form.id}-${name}`;
      input.name = name;
      const text = element("label", "", label);
      text.htmlFor = input.id;
      if (type === "select")
        for (const [value, title] of Object.entries(choices || {})) {
          const option = element("option", "", title);
          option.value = value;
          input.append(option);
        }
      else if (type === "textarea") {
        input.rows = 3;
        input.maxLength = name === "notes" && form.id === "work-client-form" ? 5000 : 2000;
      } else {
        input.type = type;
        input.maxLength = name === "name" ? 80 : name === "title" ? 140 : 200;
      }
      if (["name", "title"].includes(name)) input.required = true;
      wrapper.append(text, input);
      form.append(wrapper);
      fields[name] = input;
    }
    const actions = element("div", "form-actions span-2"),
      cancel = element("button", "btn btn-outline-secondary", "Cancelar"),
      save = element("button", "btn btn-primary", submitLabel);
    cancel.type = "button";
    save.type = "submit";
    actions.append(cancel, save);
    form.append(actions);
    return { form, fields, cancel, save };
  }
  const clientForm = makeForm(
    "#work-client-form",
    [
      ["name", "Nome do cliente *"],
      ["notes", "Anotações gerais", "textarea"],
    ],
    "Salvar cliente",
  );
  const demandForm = makeForm(
    "#work-demand-form",
    [
      ["clientId", "Cliente *", "select"],
      ["title", "Título da demanda *"],
      ["ticket", "Chamado / referência"],
      ["status", "Andamento", "select", STATUSES],
      ["priority", "Prioridade", "select", PRIORITIES],
      ["dueDate", "Prazo de entrega", "date"],
      ["waitingFor", "Aguardando quem?"],
      ["followUpDate", "Próximo acompanhamento", "date"],
      ["environment", "Ambiente / sistema"],
      ["objective", "Objetivo", "textarea"],
      ["currentBehavior", "Comportamento atual", "textarea"],
      ["expectedResult", "Resultado esperado", "textarea"],
      ["evidence", "Evidências e links de referência", "textarea"],
      ["nextAction", "Próxima ação", "textarea"],
      ["acceptance", "Critério de conclusão", "textarea"],
      ["notes", "Histórico e anotações da demanda", "textarea"],
    ],
    "Salvar demanda",
  );
  demandForm.fields.clientId.required = true;
  function setOptions(select, entries, placeholder) {
    const current = select.value;
    const options = entries.map(([id, label]) => {
      const option = element("option", "", label);
      option.value = id;
      return option;
    });
    const first = element("option", "", placeholder);
    first.value = "";
    select.replaceChildren(first, ...options);
    select.value = [...select.options].some((o) => o.value === current) ? current : "";
  }
  function reset() {
    selectedClient = "";
    editingClient = "";
    editingDemand = "";
    tab = "summary";
    clientForm.form.reset();
    demandForm.form.reset();
    $("#work-client-editor").open = false;
    $("#work-demand-editor").open = false;
    $("#work-task-search").value = "";
    $("#work-demand-filter").value = "";
  }
  function openClient(id) {
    selectedClient = id;
    $("#work-demand-filter").value = "";
    ctx.navigate("work");
    render();
  }
  function openTask(demandId = "") {
    const demand = demands.find((d) => d.id === demandId);
    ctx.tasks.createFor(demand?.clientId || selectedClient, demandId);
  }
  function clientLabel(id) {
    return clients.find((c) => c.id === id)?.name || "Cliente não encontrado";
  }
  function demandLabel(id) {
    return demands.find((d) => d.id === id)?.title || "Demanda não encontrada";
  }
  function scopeTasks() {
    return tasks.filter((t) =>
      selectedClient ? t.clientId === selectedClient : t.category === "work" || t.clientId,
    );
  }
  function editClient(client) {
    editingClient = client?.id || "";
    clientForm.form.reset();
    for (const [key, input] of Object.entries(clientForm.fields)) input.value = client?.[key] || "";
    $("#work-client-editor").open = true;
    clientForm.fields.name.focus();
  }
  clientForm.cancel.addEventListener("click", () => {
    editingClient = "";
    clientForm.form.reset();
    $("#work-client-editor").open = false;
  });
  clientForm.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = clientForm.fields.name.value.trim();
    if (!name) {
      ctx.notify("Informe o nome do cliente.", "error");
      return;
    }
    if (
      clients.some(
        (c) =>
          c.id !== editingClient &&
          c.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"),
      )
    ) {
      ctx.notify("Já existe um cliente com esse nome, inclusive entre os arquivados.", "error");
      return;
    }
    const original = clients.find((c) => c.id === editingClient);
    const client = normalizeClient({
      ...original,
      id: original?.id || uniqueId(),
      name,
      notes: clientForm.fields.notes.value,
    });
    if (original) Object.assign(original, client);
    else clients.push(client);
    ctx.persist(STORAGE_KEYS.clients, clients);
    selectedClient = client.id;
    editingClient = "";
    clientForm.form.reset();
    $("#work-client-editor").open = false;
    ctx.refresh();
    ctx.notify("Cliente salvo.");
  });
  $("#work-add-client").addEventListener("click", () => editClient());
  $("#work-edit-client").addEventListener("click", () =>
    editClient(clients.find((c) => c.id === selectedClient)),
  );
  for (const [button, property] of [
    ["#work-archive-client", "archived"],
    ["#work-favorite-client", "favorite"],
  ])
    $(button).addEventListener("click", () => {
      const client = clients.find((c) => c.id === selectedClient);
      if (!client) return;
      client[property] = !client[property];
      ctx.persist(STORAGE_KEYS.clients, clients);
      ctx.refresh();
    });
  function editDemand(demand) {
    editingDemand = demand?.id || "";
    demandForm.form.reset();
    setOptions(
      demandForm.fields.clientId,
      clients.filter((c) => !c.archived || c.id === demand?.clientId).map((c) => [c.id, c.name]),
      "Selecione um cliente",
    );
    for (const [key, input] of Object.entries(demandForm.fields))
      input.value =
        demand?.[key] ??
        (key === "clientId"
          ? selectedClient
          : key === "status"
            ? "pending"
            : key === "priority"
              ? "medium"
              : "");
    demandForm.fields.clientId.disabled = Boolean(demand);
    $("#work-demand-editor").open = true;
    demandForm.fields.title.focus();
  }
  $("#work-add-demand").addEventListener("click", () => editDemand());
  demandForm.cancel.addEventListener("click", () => {
    editingDemand = "";
    demandForm.form.reset();
    $("#work-demand-editor").open = false;
  });
  demandForm.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = Object.fromEntries(
      Object.entries(demandForm.fields).map(([key, input]) => [key, input.value]),
    );
    const original = demands.find((d) => d.id === editingDemand);
    const demand = normalizeDemand({
      ...original,
      ...raw,
      id: original?.id || uniqueId(),
      createdAt: original?.createdAt || new Date().toISOString(),
    });
    if (!demand || !clients.some((c) => c.id === demand.clientId)) {
      ctx.notify("Informe cliente e título válidos.", "error");
      return;
    }
    if (original) Object.assign(original, demand);
    else demands.push(demand);
    ctx.persist(STORAGE_KEYS.demands, demands);
    selectedClient = demand.clientId;
    editingDemand = "";
    demandForm.form.reset();
    $("#work-demand-editor").open = false;
    tab = "demands";
    ctx.refresh();
    ctx.notify("Demanda salva.");
  });
  $("#work-add-task").addEventListener("click", () => openTask());
  $("#work-task-search").addEventListener("input", renderTasks);
  $("#work-task-status").addEventListener("change", renderTasks);
  $("#work-demand-filter").addEventListener("change", renderTasks);
  $("#work-show-archived").addEventListener("change", render);
  $("#work-all-clients").addEventListener("click", () => openClient(""));
  $$("[data-work-tab]").forEach((button) =>
    button.addEventListener("click", () => {
      tab = button.dataset.workTab;
      render();
    }),
  );
  $("#work-notes-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const client = clients.find((c) => c.id === selectedClient);
    if (!client) return;
    client.notes = $("#work-notes").value.trim().slice(0, 5000);
    if (editingClient === client.id) clientForm.fields.notes.value = client.notes;
    notesSaved = client.notes;
    $("#work-notes").value = client.notes;
    ctx.persist(STORAGE_KEYS.clients, clients);
    ctx.notify("Anotações salvas.");
  });
  function renderTasks() {
    const query = $("#work-task-search").value.trim().toLocaleLowerCase("pt-BR"),
      status = $("#work-task-status").value,
      demandId = $("#work-demand-filter").value;
    const selected = scopeTasks().filter(
      (t) =>
        (!demandId || (demandId === "unassigned" ? !t.demandId : t.demandId === demandId)) &&
        (!status || t.status === status) &&
        [t.description, t.project, t.waitingFor, t.nextAction]
          .join(" ")
          .toLocaleLowerCase("pt-BR")
          .includes(query),
    );
    replacePreservingState(
      $("#work-tasks"),
      selected.length
        ? selected.map(ctx.tasks.row)
        : [renderEmpty("Nenhuma tarefa neste contexto.")],
    );
  }
  function demandCard(demand) {
    const card = element("article", "overview-card work-demand-card");
    card.append(
      element("h4", "panel-title", demand.title),
      element(
        "p",
        "help-text",
        `${clientLabel(demand.clientId)}${demand.ticket ? " · " + demand.ticket : ""}${demand.archived ? " · Arquivada" : ""}`,
      ),
    );
    const related = tasks.filter((t) => t.demandId === demand.id);
    card.append(
      element(
        "p",
        "help-text",
        `${related.filter((t) => t.completed).length}/${related.length} tarefas concluídas${demand.dueDate ? " · Prazo: " + formatDate(demand.dueDate) : ""}`,
      ),
    );
    if (demand.waitingFor)
      card.append(element("p", "next-action", `Aguardando: ${demand.waitingFor}`));
    if (demand.followUpDate)
      card.append(element("p", "help-text", `Acompanhar em: ${formatDate(demand.followUpDate)}`));
    const select = element("select", "form-select");
    select.setAttribute("aria-label", `Andamento da demanda: ${demand.title}`);
    select.dataset.uiKey = `demand:${demand.id}:status`;
    for (const [value, label] of Object.entries(STATUSES)) {
      const option = element("option", "", label);
      option.value = value;
      select.append(option);
    }
    select.value = demand.status;
    select.addEventListener("change", () => {
      demand.status = select.value;
      if (editingDemand === demand.id) demandForm.fields.status.value = demand.status;
      ctx.persist(STORAGE_KEYS.demands, demands);
      ctx.refresh();
    });
    card.append(select);
    const details = element("details", "task-extra");
    details.dataset.uiKey = `demand:${demand.id}:details`;
    details.append(element("summary", "", "Contexto da demanda"));
    for (const [key, label] of [
      ["objective", "Objetivo"],
      ["currentBehavior", "Comportamento atual"],
      ["expectedResult", "Resultado esperado"],
      ["environment", "Ambiente"],
      ["evidence", "Evidências e referências"],
      ["nextAction", "Próxima ação"],
      ["acceptance", "Critério de conclusão"],
      ["notes", "Histórico e anotações"],
    ])
      if (demand[key])
        details.append(
          element("strong", "", label),
          element("p", "task-details-text", demand[key]),
        );
    card.append(details);
    const actions = element("div", "work-actions mt-3");
    const button = (label, callback) => {
      const node = element("button", "btn btn-sm btn-outline-secondary", label);
      node.type = "button";
      node.addEventListener("click", callback);
      return node;
    };
    actions.append(
      button("Ver tarefas", () => {
        selectedClient = demand.clientId;
        tab = "tasks";
        render();
        $("#work-demand-filter").value = demand.id;
        renderTasks();
      }),
      button("Adicionar tarefa", () => openTask(demand.id)),
      button("Editar demanda", () => editDemand(demand)),
      button(demand.archived ? "Reativar demanda" : "Arquivar demanda", () => {
        demand.archived = !demand.archived;
        ctx.persist(STORAGE_KEYS.demands, demands);
        ctx.refresh();
      }),
    );
    card.append(actions);
    return card;
  }
  function render() {
    if (selectedClient && !clients.some((c) => c.id === selectedClient)) selectedClient = "";
    const client = clients.find((c) => c.id === selectedClient),
      showArchived = $("#work-show-archived").checked;
    const sorted = [...clients]
      .filter((c) => showArchived || !c.archived || c.id === selectedClient)
      .sort(
        (a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name, "pt-BR"),
      );
    for (const target of ["#work-clients", "#work-client-shortcuts"]) {
      $(target).replaceChildren(
        ...sorted.map((c) => {
          const button = element(
            "button",
            `work-client-button ${c.id === selectedClient ? "is-active" : ""}`,
            `${c.favorite ? "★ " : ""}${c.name}${c.archived ? " (arquivado)" : ""}`,
          );
          button.type = "button";
          button.setAttribute("aria-pressed", String(c.id === selectedClient));
          button.addEventListener("click", () => openClient(c.id));
          return button;
        }),
      );
    }
    $("#work-context-title").textContent = client ? client.name : "Visão geral do trabalho";
    for (const id of ["#work-edit-client", "#work-archive-client", "#work-favorite-client"])
      $(id).hidden = !client;
    $("#work-archive-client").textContent = client?.archived
      ? "Reativar cliente"
      : "Arquivar cliente";
    $("#work-favorite-client").textContent = client?.favorite ? "Remover favorito" : "Favoritar";
    $$("[data-work-tab]").forEach((button) => {
      const active = button.dataset.workTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $$("[data-work-panel]").forEach((panel) => (panel.hidden = panel.dataset.workPanel !== tab));
    const summary = workSummary(scopeTasks());
    const demandAttention = demands.filter(
      (d) =>
        (!selectedClient || d.clientId === selectedClient) &&
        !d.archived &&
        d.status !== "completed" &&
        (d.status === "waiting" || (d.followUpDate && d.followUpDate <= todayKey())),
    );
    $("#work-summary").replaceChildren(
      ...Object.entries({
        Pendentes: summary.pending,
        "Em espera": summary.waiting,
        Vencidas: summary.overdue,
        "Acompanhar agora":
          summary.followUps +
          demandAttention.filter((d) => d.followUpDate && d.followUpDate <= todayKey()).length,
        Concluídas: summary.completed,
      }).map(([label, value]) => {
        const card = element("article", "stat-card");
        card.append(element("p", "", label), element("strong", "", String(value)));
        return card;
      }),
    );
    const attention = scopeTasks().filter(
      (t) =>
        !t.completed &&
        ((t.followUpDate && t.followUpDate <= todayKey()) ||
          t.status === "waiting" ||
          isOverdue(t)),
    );
    replacePreservingState(
      $("#work-attention"),
      attention.length
        ? attention.map(ctx.tasks.row)
        : [renderEmpty("Nenhum retorno pendente neste contexto.")],
    );
    replacePreservingState(
      $("#work-demand-attention"),
      demandAttention.length
        ? demandAttention.map(demandCard)
        : [renderEmpty("Nenhuma demanda aguardando retorno ou acompanhamento.")],
    );
    const visibleDemands = demands.filter(
      (d) => (!selectedClient || d.clientId === selectedClient) && (showArchived || !d.archived),
    );
    replacePreservingState(
      $("#work-demands"),
      visibleDemands.length
        ? visibleDemands.map(demandCard)
        : [renderEmpty("Nenhuma demanda cadastrada neste contexto.")],
    );
    setOptions(
      $("#work-demand-filter"),
      [
        ["unassigned", "Tarefas avulsas"],
        ...demands
          .filter((d) => !selectedClient || d.clientId === selectedClient)
          .map((d) => [d.id, d.title + (d.archived ? " (arquivada)" : "")]),
      ],
      "Todas as demandas",
    );
    renderTasks();
    const relatedMeetings = meetings
      .filter((m) => (client ? m.clientId === client.id : m.category === "work" || m.clientId))
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    $("#work-agenda").replaceChildren(
      ...(relatedMeetings.length
        ? relatedMeetings.map(ctx.agenda.meetingRow)
        : [
            renderEmpty(
              "Nenhum compromisso de trabalho neste contexto. Selecione o cliente no cadastro da Agenda.",
            ),
          ]),
    );
    $("#work-notes-form").hidden = !client;
    $("#work-notes-empty").hidden = Boolean(client);
    if (
      $("#work-notes").dataset.clientId !== selectedClient ||
      $("#work-notes").value === notesSaved
    ) {
      $("#work-notes").value = client?.notes || "";
      notesSaved = client?.notes || "";
      $("#work-notes").dataset.clientId = selectedClient;
    }
  }
  // Sugestões iniciais somente quando ainda não existe coleção de clientes.
  try {
    if (
      localStorage.getItem(STORAGE_KEYS.clients) === null &&
      !loadIssues.includes(STORAGE_KEYS.clients)
    ) {
      clients.push(
        ...["Mazer", "Manuchar", "Demandas internas"].map((name) =>
          normalizeClient({ id: uniqueId(), name }),
        ),
      );
      ctx.persist(STORAGE_KEYS.clients, clients);
    }
  } catch {}
  return { render, reset, clientLabel, demandLabel, openClient };
}
