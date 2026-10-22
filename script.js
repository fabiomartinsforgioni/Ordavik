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
// CADASTRO E CONCLUSÃO DE TAREFAS
// ==================================

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const tarefa = input.value.trim();
    if (tarefa === "") return;

    const item = document.createElement("li");
    item.classList.add("task-item");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");

    const taskText = document.createElement("span");
    taskText.classList.add("task-text");
    taskText.textContent = tarefa;

    const label = document.createElement("label");
    label.classList.add("task-label");
    label.append(checkbox, taskText);

    checkbox.addEventListener("change", function () {
        item.classList.toggle("completed", checkbox.checked);
        refreshTaskUI();
    });

    item.appendChild(label);
    taskList.appendChild(item);

    // Exibe a tarefa recém-criada mesmo se outro filtro estiver selecionado.
    setFilter("all");
    refreshTaskUI();

    input.value = "";
    input.focus();
});

// Estado inicial: sem tarefas persistidas nesta sprint.
refreshTaskUI();
