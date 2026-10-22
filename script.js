const form = document.querySelector('#task-form');

const input = document.querySelector('#task-input');

const taskList = document.querySelector('#task-list');

form.addEventListener("submit", function(event) {
    
    event.preventDefault();

    const tarefa = input.value.trim();

    if (tarefa === "") {
        return;
    }

    const item = document.createElement("li");

    item.textContent = tarefa;

    taskList.appendChild(item);

    input.value = "";
});