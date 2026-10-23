# 📚 TaskFlow | Guia de Estudos da Sprint 03

## Objetivo da Sprint

Editar tarefas existentes e atribuir prioridades (`low`, `medium`, `high`) com armazenamento local, compatibilidade com tarefas antigas e indicação visual.

## Estrutura e responsabilidades

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Declara as regiões da aplicação, formulários, botões e atributos semânticos. |
| `style.css` | Define dimensões, cores, organização visual e responsividade. |
| `script.js` | Controla interações, valida os dados e mantém interface e armazenamento consistentes. |

### 1. JavaScript: DOM

- `document.querySelector("#task-input")`: encontra um elemento pelo ID.
- `document.querySelectorAll("[data-filter]")`: encontra todos os botões com esse atributo.
- `document.createElement("li")`: cria um novo item sem alterar o HTML original.
- `element.append(...)`: adiciona elementos filhos na ordem informada.
- `element.textContent = descricao`: insere texto sem interpretá-lo como HTML.
- `element.classList.toggle("completed", status)`: ativa/desativa uma classe.
- `element.dataset.priority`: lê ou altera o atributo `data-priority`.

### 2. JavaScript: eventos

O método `addEventListener("click", callback)` registra uma função que será executada quando um evento ocorrer. O `submit` do formulário é interceptado com `event.preventDefault()` para evitar recarregar a página.

Durante a edição, o evento `keydown` interpreta **Enter** (salvar) e **Escape** (cancelar). O evento também funciona quando o foco está no seletor de prioridade, pois os eventos podem se propagar até seu elemento pai.

### 3. Objetos e arrays

Cada tarefa é um objeto:

```javascript
{
    id: "tarefa-001",
    description: "Estudar JavaScript",
    completed: false,
    priority: "high",
}
```

- `tasks.push(task)`: adiciona uma tarefa ao array.
- `tasks.filter(...)`: cria um array só com os itens aprovados pela condição; é usado para exclusão e validação.
- `tasks.map(...)`: transforma todos os itens, usado para atribuir prioridade padrão às tarefas antigas.
- `tasks.forEach(...)`: percorre a lista, usado para construir o HTML ao carregar a página.
- `Object.keys(PRIORITY_LABELS)`: devolve as chaves `low`, `medium`, `high` para montar o `<select>`.
- `...task`: copia propriedades de um objeto para outro.
- `new Set()`: mantém um conjunto de IDs já processados e ajuda a evitar duplicações.

### 4. Funções e retornos

Uma **função** agrupa uma responsabilidade com nome claro. Exemplos no projeto:

| Função | O que faz |
| --- | --- |
| `normalizePriority` | Converte prioridades ausentes ou inválidas em `medium`. |
| `loadTasks` | Carrega, valida e normaliza dados do `localStorage`. |
| `saveTasks` | Grava o array em formato JSON no navegador. |
| `generateTaskId` | Produz um identificador para a tarefa. |
| `showView` | Exibe a página Início ou Minhas tarefas. |
| `applyFilter` | Controla quais tarefas estão visíveis. |
| `refreshTaskUI` | Atualiza contadores, progresso e estado vazio. |
| `createTaskElement` | Constrói a representação HTML de uma tarefa. |
| `updatePriorityBadge` | Atualiza texto e cor da prioridade via `data-priority`. |
| `startTaskEditing` | Gerencia o ciclo de editar, salvar ou cancelar. |

`return` encerra a função e pode devolver um valor. Uma instrução `if` executa um bloco conforme uma condição lógica.

### 5. Persistência e JSON

`localStorage` salva pares chave/valor como **strings**. Por isso usamos:

```javascript
localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
const tasks = JSON.parse(localStorage.getItem("taskflow-tasks"));
```

O primeiro método converte objetos em string, e o segundo recria os objetos. Uma verificação com `try/catch` impede que o app trave com dados inválidos ou armazenamento indisponível.

**Importante:** o `localStorage` não é um banco de dados remoto; ele pertence ao navegador e à origem da página.

### 6. CSS: Flexbox, Grid e responsividade

- `display: flex` organiza elementos no mesmo eixo, como descrição, prioridade e botões.
- `display: grid` distribui as regiões principais da aplicação.
- `flex: 0 0 155px` evita que o seletor de prioridade ocupe 100% da largura.
- `@media (max-width: 480px)` ajusta layout para celulares.
- `[data-priority="high"]` estiliza etiquetas apenas das tarefas com prioridade alta.
- `var(--tf-primary)` usa uma variável de cor que muda conforme o tema.

### 7. Acessibilidade

- `aria-label` fornece nomes para botões e campos sem texto visível.
- `aria-pressed` indica o estado dos botões de filtro/tema.
- `aria-current` indica a página ativa na navegação.
- `focus()` e `:focus-visible` ajudam na navegação por teclado.
- O atributo `hidden` esconde painéis ou itens não exibidos pelo filtro.

### 8. Git: revisão antes do commit

```powershell
git status              # Arquivos modificados e branch atual
git diff --check        # Verifica problemas simples de espaço em alterações
git diff --stat         # Mostra resumo por arquivo
git diff                # Mostra as linhas exatas que foram alteradas
node --check script.js  # Verifica erros de sintaxe JavaScript (precisa do Node.js)
```

**Nunca execute `git add`, `git commit`, `git push` ou `git pull` automaticamente enquanto ainda estiver conferindo arquivos locais ou resolvendo alterações não salvas.**

### 9. Checklist antes do Pull Request

- [ ] Conferir `git status` e `git diff`.
- [ ] Testar os três níveis de prioridade e os temas claro/escuro.
- [ ] Testar salvar/cancelar edição e persistir mudanças.
- [ ] Testar dados anteriores à Sprint 03.
- [ ] Testar filtros, conclusão e exclusão após editar uma tarefa.
- [ ] Conferir interface em telas pequenas.
- [ ] Somente depois preparar o commit e o Pull Request.
