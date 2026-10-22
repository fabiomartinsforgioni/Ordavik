// Elementos da aplicação
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

// Evento de cadastro de tarefas
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const tarefa = input.value.trim();

    if (tarefa === "") {
        return;
    }

    // Cria o elemento da tarefa
    const item = document.createElement("li");

    item.classList.add("task-item");

    // Cria o checkbox
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");

    // Cria a descrição da tarefa
    const taskText = document.createElement("span");

    taskText.classList.add("task-text");
    taskText.textContent = tarefa;

    // Agrupa checkbox e descrição
    const label = document.createElement("label");

    label.classList.add("task-label");

    label.append(checkbox, taskText);

    // Evento para concluir ou reabrir uma tarefa
    checkbox.addEventListener("change", function() {

        item.classList.toggle(
            "completed",
            checkbox.checked
        );

    });

    // Adiciona os elementos à página
    item.appendChild(label);

    taskList.appendChild(item);

    // Limpa o formulário
    input.value = "";
    input.focus();

});