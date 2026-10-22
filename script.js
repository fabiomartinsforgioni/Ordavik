// ==================================
// TASKFLOW | ELEMENTOS DA INTERFACE
// ==================================

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = themeToggle.querySelector("i");
const sidebarButtons = document.querySelectorAll(".sidebar-link");
const viewButtons = document.querySelectorAll("[data-view-target]");
const panels = document.querySelectorAll("[data-view-panel]");
const filterButtons = document.querySelectorAll("[data-filter]");
const emptyState = document.querySelector("#empty-state");
const emptyStateText = document.querySelector("#empty-state-text");

let activeFilter = "all";

// ==================================
// ARMAZENAMENTO DAS TAREFAS
// ==================================

const TASKS_STORAGE_KEY = "taskflow-tasks";
let tasks = loadTasks();

function loadTasks() {
    try {
        const raw = localStorage.getItem(TASKS_STORAGE_KEY);
        if (raw === null) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        const seenIds = new Set();

        // Ignora entradas inválidas: armazenamento do navegador não é confiável.
        return parsed.filter(function (task) {
            if (!task || typeof task !== "object") return false;
            if (typeof task.id !== "string" || task.id.length === 0 || seenIds.has(task.id)) return false;
            if (typeof task.description !== "string" || task.description.trim().length === 0 || task.description.length > 140) return false;
            if (typeof task.completed !== "boolean") return false;

            seenIds.add(task.id);
            return true;
        });
    } catch {
        // Falha de leitura, conteúdo inválido ou bloqueio do armazenamento.
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
        // A aplicação continua funcionando apenas em memória se não puder salvar.
        console.warn("TaskFlow: não foi possível armazenar as tarefas neste navegador.");
    }
}

function generateTaskId() {
    // randomUUID pode não estar disponível em alguns contextos locais (file://).
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 11);
}


// ==================================
// TEMA CLARO / ESCURO
// ==================================

function applyTheme(theme) {
    const darkMode = theme === "dark";

    document.documentElement.setAttribute("data-bs-theme", darkMode ? "dark" : "light");
    themeIcon.className = darkMode ? "bi bi-sun" : "bi bi-moon-stars";
    themeToggle.setAttribute("aria-label", darkMode ? "Ativar modo claro" : "Ativar modo escuro");
    themeToggle.setAttribute("aria-pressed", String(darkMode));
    themeToggle.title = darkMode ? "Ativar modo claro" : "Ativar modo escuro";
}

applyTheme(document.documentElement.getAttribute("data-bs-theme"));

themeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
        localStorage.setItem("taskflow-theme", nextTheme);
    } catch {
        // Se o armazenamento estiver indisponível, a alternância ainda funciona.
    }
});

// ==================================
// NAVEGAÇÃO ENTRE TELAS
// ==================================

function showView(view) {
    if (view !== "home" && view !== "tasks") return;

    panels.forEach(function (panel) {
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

    // Leva o foco ao título do painel para orientar a navegação por teclado.
    const heading = document.querySelector(view === "home" ? "#home-heading" : "#tasks-heading");
    heading.focus({ preventScroll: true });
}

viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        showView(button.dataset.viewTarget);
    });
});

// ==================================
// FILTROS E INDICADORES
// ==================================

function applyFilter() {
    const items = Array.from(taskList.querySelectorAll(".task-item"));
    let visibleCount = 0;

    items.forEach(function (item) {
        const completed = item.classList.contains("completed");
        const visible =
            activeFilter === "all" ||
            (activeFilter === "pending" && !completed) ||
            (activeFilter === "completed" && completed);

        item.hidden = !visible;
        if (visible) visibleCount++;
    });

    emptyState.hidden = visibleCount > 0;

    if (items.length === 0) {
        emptyStateText.textContent = "Nenhuma tarefa cadastrada. Que tal começar?";
    } else if (activeFilter === "pending") {
        emptyStateText.textContent = "Nenhuma tarefa pendente.";
    } else if (activeFilter === "completed") {
        emptyStateText.textContent = "Nenhuma tarefa concluída ainda.";
    } else {
        emptyStateText.textContent = "Nenhuma tarefa encontrada.";
    }
}

function setFilter(filter) {
    if (!["all", "pending", "completed"].includes(filter)) return;

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

function refreshTaskUI() {
    const items = Array.from(taskList.querySelectorAll(".task-item"));
    const total = items.length;
    const completed = items.filter(function (item) {
        return item.classList.contains("completed");
    }).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.querySelector("#summary-total").textContent = total;
    document.querySelector("#summary-pending").textContent = pending;
    document.querySelector("#summary-completed").textContent = completed;
    document.querySelector("#task-total-badge").textContent = total;
    document.querySelector("#progress-label").textContent = percent + "% concluído";
    document.querySelector("#progress-bar").style.width = percent + "%";
    document.querySelector("#progress-track").setAttribute("aria-valuenow", String(percent));

    const status = document.querySelector("#home-status");

    if (total === 0) {
        status.textContent = "Você ainda não cadastrou tarefas.";
    } else if (pending === 0) {
        status.textContent = "Parabéns! Todas as suas tarefas estão concluídas.";
    } else {
        status.textContent = "Você tem " + pending + (pending === 1 ? " tarefa pendente." : " tarefas pendentes.");
    }

    applyFilter();
}

// ==================================
// CADASTRO, CONCLUSÃO E EXCLUSÃO
// ==================================

function createTaskElement(task) {
    const item = document.createElement("li");
    item.classList.add("task-item");
    item.classList.toggle("completed", task.completed);

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

    checkbox.addEventListener("change", function () {
        task.completed = checkbox.checked;
        item.classList.toggle("completed", task.completed);
        saveTasks();
        refreshTaskUI();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("task-delete");
    deleteButton.setAttribute("aria-label", "Excluir tarefa: " + task.description);
    deleteButton.title = "Excluir tarefa";

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "bi bi-trash3";
    deleteIcon.setAttribute("aria-hidden", "true");
    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener("click", function () {
        // O id identifica a tarefa, mesmo que existam descrições repetidas.
        tasks = tasks.filter(function (savedTask) {
            return savedTask.id !== task.id;
        });
        item.remove();
        saveTasks();
        refreshTaskUI();
    });

    item.append(label, deleteButton);
    return item;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = input.value.trim();
    if (description === "") return;

    const task = {
        id: generateTaskId(),
        description: description,
        completed: false
    };

    tasks.push(task);
    taskList.appendChild(createTaskElement(task));
    saveTasks();

    // Exibe a tarefa recém-criada, mesmo quando outro filtro está ativo.
    setFilter("all");
    refreshTaskUI();

    input.value = "";
    input.focus();
});

// Reconstrói as tarefas salvas e atualiza o painel sem recarregar a página.
tasks.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
});
refreshTaskUI();
