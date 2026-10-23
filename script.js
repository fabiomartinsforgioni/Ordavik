// ============================================================================
// TASKFLOW | GERENCIAMENTO DE TAREFAS
// ============================================================================
// Este arquivo controla os dados e os comportamentos da aplicação.
// Organização:
//   1. Elementos do HTML e configurações
//   2. Leitura, validação e gravação de tarefas
//   3. Alternância de tema e navegação
//   4. Filtros e indicadores do painel
//   5. Criação, edição, conclusão e exclusão de tarefas
//   6. Inicialização da aplicação
//
// As tarefas são objetos: { id, description, completed, priority }.
// O array "tasks" é a fonte principal dos dados; o HTML mostra esses dados.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. ELEMENTOS DA INTERFACE E CONFIGURAÇÕES
// ---------------------------------------------------------------------------

// querySelector procura o primeiro elemento correspondente ao seletor CSS.
// IDs utilizam "#", enquanto classes utilizam ".".
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const prioritySelect = document.querySelector("#task-priority");
// Campo responsável por pesquisar tarefas pela descrição.
const searchInput = document.querySelector("#task-search");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyStateText = document.querySelector("#empty-state-text");

const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = themeToggle.querySelector("i");

// querySelectorAll retorna uma coleção; forEach percorre seus elementos.
const sidebarButtons = document.querySelectorAll(".sidebar-link");
const viewButtons = document.querySelectorAll("[data-view-target]");
const panels = document.querySelectorAll("[data-view-panel]");
const filterButtons = document.querySelectorAll("[data-filter]");

const TASKS_STORAGE_KEY = "taskflow-tasks";
const THEME_STORAGE_KEY = "taskflow-theme";
const MAX_TASK_LENGTH = 140;
const DEFAULT_PRIORITY = "medium";

// Cada chave é gravada no objeto da tarefa; cada valor aparece na tela.
const PRIORITY_LABELS = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

// Guarda o filtro selecionado e as tarefas carregadas do navegador.
let activeFilter = "all";
let tasks = loadTasks();

// ---------------------------------------------------------------------------
// 2. ARMAZENAMENTO E VALIDAÇÃO DOS DADOS
// ---------------------------------------------------------------------------

/**
 * Garante que a prioridade seja um dos três valores permitidos.
 * Tarefas antigas (sem priority) recebem a prioridade padrão "medium".
 *
 * @param {string | undefined} priority - Valor recebido do formulário ou JSON.
 * @returns {string} Prioridade validada.
 */
function normalizePriority(priority) {
  const validPriorities = Object.keys(PRIORITY_LABELS);

  if (validPriorities.includes(priority)) {
    return priority;
  }

  return DEFAULT_PRIORITY;
}

/**
 * Recupera tarefas persistidas e descarta registros inválidos.
 * Usa try/catch porque localStorage ou JSON.parse podem lançar erros.
 *
 * @returns {Array} Lista segura de tarefas para a interface.
 */
function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);

    // A chave ainda não existe: nenhum cadastro foi feito neste navegador.
    if (raw === null) return [];

    // JSON.parse converte a string armazenada em valor JavaScript.
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Um Set guarda IDs já encontrados e evita tarefas duplicadas.
    const seenIds = new Set();

    // filter remove entradas ruins; map normaliza as entradas válidas.
    return parsed
      .filter(function (task) {
        if (!task || typeof task !== "object" || Array.isArray(task)) {
          return false;
        }

        const validId =
          typeof task.id === "string" &&
          task.id.length > 0 &&
          !seenIds.has(task.id);

        const validDescription =
          typeof task.description === "string" &&
          task.description.trim().length > 0 &&
          task.description.length <= MAX_TASK_LENGTH;

        const validCompleted = typeof task.completed === "boolean";

        if (!validId || !validDescription || !validCompleted) {
          return false;
        }

        seenIds.add(task.id);
        return true;
      })
      .map(function (task) {
        return {
          // Spread (...) copia as propriedades sem alterar o objeto lido.
          ...task,
          priority: normalizePriority(task.priority),
        };
      });
  } catch (error) {
    // Armazenamento bloqueado ou JSON inválido não deve travar a página.
    console.warn("TaskFlow: não foi possível carregar as tarefas.", error);
    return [];
  }
}

/** Salva o array de tarefas como texto JSON no navegador. */
function saveTasks() {
  try {
    // JSON.stringify transforma os objetos em texto para o localStorage.
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Mesmo sem armazenamento, o app continua funcionando nesta página.
    console.warn("TaskFlow: não foi possível salvar as tarefas.", error);
  }
}

/**
 * Gera uma identificação para cada tarefa.
 * O fallback atende a ambientes locais sem crypto.randomUUID (file://).
 *
 * @returns {string} Identificador único na prática para esta aplicação.
 */
function generateTaskId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 11)
  );
}

// ---------------------------------------------------------------------------
// 3. TEMA E NAVEGAÇÃO
// ---------------------------------------------------------------------------

/** Aplica as cores do tema e atualiza os textos de acessibilidade do botão. */
function applyTheme(theme) {
  const darkMode = theme === "dark";

  // O atributo data-bs-theme é reconhecido pelo Bootstrap e pelo nosso CSS.
  document.documentElement.setAttribute(
    "data-bs-theme",
    darkMode ? "dark" : "light",
  );
  themeIcon.className = darkMode ? "bi bi-sun" : "bi bi-moon-stars";
  themeToggle.setAttribute(
    "aria-label",
    darkMode ? "Ativar modo claro" : "Ativar modo escuro",
  );
  themeToggle.setAttribute("aria-pressed", String(darkMode));
  themeToggle.title = darkMode ? "Ativar modo claro" : "Ativar modo escuro";
}

// O HTML já carrega a preferência antes do CSS para evitar piscar na abertura.
applyTheme(document.documentElement.getAttribute("data-bs-theme"));

themeToggle.addEventListener("click", function () {
  const currentTheme = document.documentElement.getAttribute("data-bs-theme");
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch {
    // A troca de tema funciona mesmo sem persistência.
  }
});

/** Mostra apenas a seção selecionada, sem recarregar a página. */
function showView(view) {
  if (view !== "home" && view !== "tasks") return;

  panels.forEach(function (panel) {
    // dataset.viewPanel acessa o atributo HTML data-view-panel.
    panel.hidden = panel.dataset.viewPanel !== view;
  });

  sidebarButtons.forEach(function (button) {
    const isActive = button.dataset.viewTarget === view;
    button.classList.toggle("is-active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  // O foco no título orienta quem usa navegação por teclado.
  const heading = document.querySelector(
    view === "home" ? "#home-heading" : "#tasks-heading",
  );
  heading.focus({ preventScroll: true });
}

viewButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showView(button.dataset.viewTarget);
  });
});

// ---------------------------------------------------------------------------
// 4. FILTROS E INDICADORES
// ---------------------------------------------------------------------------

/**
 * Oculta os itens que não pertencem ao filtro atual e controla o estado vazio.
 * A propriedade hidden altera a visibilidade sem remover as tarefas dos dados.
 */
/**
 * Filtra as tarefas utilizando dois critérios:
 *
 * 1. Status da tarefa (Todas, Pendentes ou Concluídas).
 * 2. Texto informado no campo de pesquisa.
 *
 * Uma tarefa só aparece quando atende aos dois critérios.
 *
 * O método não exclui tarefas nem altera o LocalStorage.
 * Apenas controla quais elementos aparecem na interface.
 */
function applyFilter() {
  // Recupera todos os elementos visuais das tarefas.
  const items = Array.from(taskList.querySelectorAll(".task-item"));

  // Obtém o texto pesquisado, removendo espaços
  // desnecessários e ignorando diferenças de maiúsculas.
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("pt-BR");

  // Armazena a quantidade de tarefas visíveis.
  let visibleCount = 0;

  // Percorre todas as tarefas existentes na interface.
  items.forEach(function (item) {
    // Verifica se a tarefa está concluída.
    const completed = item.classList.contains("completed");

    // Verifica se a tarefa corresponde ao filtro de status.
    const matchesStatus =
      activeFilter === "all" ||
      (activeFilter === "pending" && !completed) ||
      (activeFilter === "completed" && completed);

    // Recupera a descrição apresentada na tarefa.
    const description = item
      .querySelector(".task-text")
      .textContent.toLocaleLowerCase("pt-BR");

    // Verifica se a descrição contém o texto pesquisado.
    const matchesSearch = description.includes(searchTerm);

    // A tarefa precisa atender aos dois critérios.
    const visible = matchesStatus && matchesSearch;

    // Exibe ou oculta o elemento.
    item.hidden = !visible;

    // Incrementa o contador quando a tarefa está visível.
    if (visible) {
      visibleCount++;
    }
  });

  // Exibe o estado vazio quando nenhuma tarefa corresponde.
  emptyState.hidden = visibleCount > 0;

  // Define a mensagem apresentada quando não há resultados.
  if (items.length === 0) {
    emptyStateText.textContent = "Nenhuma tarefa cadastrada. Que tal começar?";
  } else if (visibleCount === 0 && searchTerm !== "") {
    emptyStateText.textContent =
      "Nenhuma tarefa encontrada para esta pesquisa.";
  } else if (activeFilter === "pending") {
    emptyStateText.textContent = "Nenhuma tarefa pendente.";
  } else if (activeFilter === "completed") {
    emptyStateText.textContent = "Nenhuma tarefa concluída ainda.";
  } else {
    emptyStateText.textContent = "Nenhuma tarefa encontrada.";
  }
}
/** Altera o filtro selecionado e sincroniza os botões da barra. */
function setFilter(filter) {
  const allowedFilters = ["all", "pending", "completed"];
  if (!allowedFilters.includes(filter)) return;

  activeFilter = filter;

  filterButtons.forEach(function (button) {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  applyFilter();
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setFilter(button.dataset.filter);
  });
});

/**
 * Executa a filtragem sempre que o usuário
 * modifica o conteúdo do campo de pesquisa.
 *
 * Não precisamos clicar em um botão Buscar.
 */
searchInput.addEventListener("input", function () {
  applyFilter();
});

/** Atualiza quantidades, porcentagem, barra de progresso e mensagens. */
function refreshTaskUI() {
  // Calculamos pelos dados (tasks), e não pelo HTML, para evitar divergências.
  const total = tasks.length;
  const completed = tasks.filter(function (task) {
    return task.completed;
  }).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.querySelector("#summary-total").textContent = total;
  document.querySelector("#summary-pending").textContent = pending;
  document.querySelector("#summary-completed").textContent = completed;
  document.querySelector("#task-total-badge").textContent = total;

  document.querySelector("#progress-label").textContent =
    percent + "% concluído";
  document.querySelector("#progress-bar").style.width = percent + "%";
  document
    .querySelector("#progress-track")
    .setAttribute("aria-valuenow", String(percent));

  const status = document.querySelector("#home-status");

  if (total === 0) {
    status.textContent = "Você ainda não cadastrou tarefas.";
  } else if (pending === 0) {
    status.textContent = "Parabéns! Todas as suas tarefas estão concluídas.";
  } else {
    status.textContent =
      "Você tem " +
      pending +
      (pending === 1 ? " tarefa pendente." : " tarefas pendentes.");
  }

  // Reaplica o filtro após qualquer mudança na lista.
  applyFilter();
}

// ---------------------------------------------------------------------------
// 5. CRUD DE TAREFAS (CRIAR, LER, EDITAR E EXCLUIR)
// ---------------------------------------------------------------------------
// CRUD é a sigla de Create, Read, Update e Delete.
// A conclusão de tarefas altera a propriedade "completed" (Update).

/**
 * Cria o componente visual de uma tarefa.
 * textContent, em vez de innerHTML, evita interpretar a descrição como HTML.
 *
 * @param {{id:string, description:string, completed:boolean, priority:string}} task
 * @returns {HTMLLIElement} Elemento <li> pronto para ser inserido na lista.
 */
function createTaskElement(task) {
  const item = document.createElement("li");
  item.classList.add("task-item");
  item.classList.toggle("completed", task.completed);

  // Checkbox e descrição ficam dentro de um <label>, aumentando a área de clique.
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("task-checkbox");
  checkbox.checked = task.completed;

  const taskText = document.createElement("span");
  taskText.classList.add("task-text");
  taskText.textContent = task.description;

  const label = document.createElement("label");
  label.classList.add("task-label");
  label.append(checkbox, taskText);

  // O CSS lê data-priority para escolher a cor de cada etiqueta.
  const priorityBadge = document.createElement("span");
  priorityBadge.classList.add("task-priority-badge");
  updatePriorityBadge(priorityBadge, task.priority);

  // Botão de edição, com nome acessível para leitores de tela.
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.classList.add("task-edit");
  editButton.title = "Editar tarefa";

  const editIcon = document.createElement("i");
  editIcon.className = "bi bi-pencil-square";
  editIcon.setAttribute("aria-hidden", "true");
  editButton.appendChild(editIcon);

  // Botão de exclusão. A descrição diferencia os botões de várias tarefas.
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.classList.add("task-delete");
  deleteButton.title = "Excluir tarefa";

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "bi bi-trash3";
  deleteIcon.setAttribute("aria-hidden", "true");
  deleteButton.appendChild(deleteIcon);

  // Centraliza os nomes acessíveis: também será usada ao editar a descrição.
  function updateActionLabels() {
    editButton.setAttribute("aria-label", "Editar tarefa: " + task.description);
    deleteButton.setAttribute(
      "aria-label",
      "Excluir tarefa: " + task.description,
    );
  }

  updateActionLabels();

  checkbox.addEventListener("change", function () {
    task.completed = checkbox.checked;
    item.classList.toggle("completed", task.completed);
    saveTasks();
    refreshTaskUI();
  });

  deleteButton.addEventListener("click", function () {
    // A comparação por ID exclui apenas o registro selecionado.
    tasks = tasks.filter(function (savedTask) {
      return savedTask.id !== task.id;
    });

    item.remove();
    saveTasks();
    refreshTaskUI();
  });

  editButton.addEventListener("click", function () {
    startTaskEditing(task, {
      item,
      taskText,
      priorityBadge,
      editButton,
      updateActionLabels,
    });
  });

  // A ordem do append determina a ordem visual dos elementos no <li>.
  item.append(label, priorityBadge, editButton, deleteButton);
  return item;
}

/** Atualiza texto e atributo da etiqueta visual de prioridade. */
function updatePriorityBadge(badge, priority) {
  const validPriority = normalizePriority(priority);
  badge.dataset.priority = validPriority;
  badge.textContent = "Prioridade: " + PRIORITY_LABELS[validPriority];
}

/**
 * Ativa o modo de edição e conecta os botões Salvar/Cancelar.
 * Os valores só são modificados no objeto após clicar em Salvar.
 *
 * @param {object} task - Objeto da tarefa existente.
 * @param {object} elements - Elementos desta tarefa já criados no HTML.
 */
function startTaskEditing(task, elements) {
  const { item, taskText, priorityBadge, editButton, updateActionLabels } =
    elements;

  // Evita abrir duas edições simultâneas na mesma tarefa.
  if (item.classList.contains("is-editing")) return;

  // Cria o campo de descrição já preenchido com o valor atual.
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "form-control task-edit-input";
  editInput.value = task.description;
  editInput.maxLength = MAX_TASK_LENGTH;
  editInput.required = true;
  editInput.setAttribute("aria-label", "Editar descrição da tarefa");

  // Monta as opções usando a mesma fonte de rótulos do restante do sistema.
  const editPrioritySelect = document.createElement("select");
  editPrioritySelect.className = "form-select task-edit-priority";
  editPrioritySelect.setAttribute("aria-label", "Editar prioridade da tarefa");

  Object.keys(PRIORITY_LABELS).forEach(function (priority) {
    const option = document.createElement("option");
    option.value = priority;
    option.textContent = PRIORITY_LABELS[priority];
    editPrioritySelect.appendChild(option);
  });

  editPrioritySelect.value = normalizePriority(task.priority);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "btn btn-primary btn-sm";
  saveButton.textContent = "Salvar";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn btn-outline-secondary btn-sm";
  cancelButton.textContent = "Cancelar";

  const editArea = document.createElement("div");
  editArea.className = "task-edit-area";
  editArea.append(editInput, editPrioritySelect, saveButton, cancelButton);

  /** Fecha a área de edição e devolve o foco ao botão original. */
  function finishEditing() {
    item.classList.remove("is-editing");
    editArea.remove();
    editButton.focus();
  }

  /** Valida o texto, altera o objeto e salva no navegador. */
  function saveEditing() {
    const updatedDescription = editInput.value.trim();

    if (
      updatedDescription.length === 0 ||
      updatedDescription.length > MAX_TASK_LENGTH
    ) {
      editInput.setCustomValidity(
        "A descrição deve ter entre 1 e " + MAX_TASK_LENGTH + " caracteres.",
      );
      editInput.reportValidity();
      return;
    }

    const updatedPriority = normalizePriority(editPrioritySelect.value);

    // Preservamos id e completed: editar não significa recriar ou concluir.
    task.description = updatedDescription;
    task.priority = updatedPriority;

    taskText.textContent = updatedDescription;
    updatePriorityBadge(priorityBadge, updatedPriority);
    updateActionLabels();

    // Persiste a descrição e a prioridade atualizadas.
    saveTasks();

    // Encerra a edição antes de atualizar a visibilidade.
    finishEditing();

    // Reaplica os filtros e a pesquisa após a alteração.
    refreshTaskUI();
  }

  // Ao voltar a digitar, limpa uma eventual mensagem de validação anterior.
  editInput.addEventListener("input", function () {
    editInput.setCustomValidity("");
  });

  saveButton.addEventListener("click", saveEditing);
  cancelButton.addEventListener("click", finishEditing);

  // Keydown no contêiner funciona no input e no select (propagação do evento).
  editArea.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      finishEditing();
    } else if (event.key === "Enter") {
      event.preventDefault();
      saveEditing();
    }
  });

  item.classList.add("is-editing");
  item.appendChild(editArea);

  editInput.focus();
  editInput.select();
}

// Cadastro: submit é acionado pelo botão Adicionar ou pela tecla Enter.
form.addEventListener("submit", function (event) {
  // Evita o envio tradicional do formulário e o recarregamento da página.
  event.preventDefault();

  const description = input.value.trim();
  if (description.length === 0 || description.length > MAX_TASK_LENGTH) return;

  const task = {
    id: generateTaskId(),
    description: description,
    completed: false,
    priority: normalizePriority(prioritySelect.value),
  };

  tasks.push(task);
  taskList.appendChild(createTaskElement(task));
  saveTasks();

  // Limpa a pesquisa para mostrar a tarefa recém-cadastrada.
  searchInput.value = "";

  // Retorna ao filtro Todas.
  setFilter("all");

  // Atualiza os indicadores e a lista.
  refreshTaskUI();

  input.value = "";
  prioritySelect.value = DEFAULT_PRIORITY;
  input.focus();
});

// ---------------------------------------------------------------------------
// 6. INICIALIZAÇÃO
// ---------------------------------------------------------------------------

// Recria a lista depois de atualizar a página, usando os dados persistidos.
tasks.forEach(function (task) {
  taskList.appendChild(createTaskElement(task));
});

// Calcula os indicadores e apresenta o estado vazio inicial, se necessário.
refreshTaskUI();
